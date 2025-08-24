import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { RateLimitMiddleware } from './rate-limit.middleware';
import { RateLimitExceededException } from '../exceptions/business.exceptions';
import { RedisService } from '../../modules/redis/redis.service';
import { LoggerService } from '../logger/logger.service';

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockLoggerService: jest.Mocked<LoggerService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const mockRequest = {
    ip: '127.0.0.1',
    user: { id: 'user-123' },
    headers: { 'x-tenant-id': 'tenant-123' },
    path: '/api/test',
    get: jest.fn(),
  } as unknown as Request;

  const mockResponse = {
    setHeader: jest.fn(),
  } as unknown as Response;

  const mockNext = jest.fn() as NextFunction;

  beforeEach(async () => {
    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      expire: jest.fn(),
    } as any;

    mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config = {
          RATE_LIMIT_GLOBAL: 1000,
          RATE_LIMIT_API: 100,
          RATE_LIMIT_AUTH: 5,
          RATE_LIMIT_UPLOAD: 10,
          RATE_LIMIT_GUEST: 50,
        };
        return config[key as keyof typeof config] || defaultValue;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitMiddleware,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    middleware = module.get<RateLimitMiddleware>(RateLimitMiddleware);
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', async () => {
      mockRedisService.get.mockResolvedValueOnce('5').mockResolvedValueOnce(Date.now().toString());
      mockRedisService.set.mockResolvedValue(true);

      const config = {
        windowMs: 60000,
        maxRequests: 100,
      };

      const result = await middleware.checkRateLimit('test-key', config);

      expect(result.remaining).toBeGreaterThan(0);
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should block requests exceeding limit', async () => {
      mockRedisService.get.mockResolvedValueOnce('100').mockResolvedValueOnce(Date.now().toString());
      mockRedisService.set.mockResolvedValue(true);

      const config = {
        windowMs: 60000,
        maxRequests: 100,
      };

      const result = await middleware.checkRateLimit('test-key', config);

      expect(result.remaining).toBeLessThan(0);
    });

    it('should reset window when expired', async () => {
      const oldTimestamp = (Date.now() - 70000).toString(); // 70 seconds ago
      mockRedisService.get.mockResolvedValueOnce('50').mockResolvedValueOnce(oldTimestamp);
      mockRedisService.set.mockResolvedValue(true);

      const config = {
        windowMs: 60000, // 60 second window
        maxRequests: 100,
      };

      const result = await middleware.checkRateLimit('test-key', config);

      // Should have reset count
      expect(result.count).toBe(1);
      expect(result.remaining).toBe(99);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedisService.get.mockRejectedValue(new Error('Redis connection failed'));

      const config = {
        windowMs: 60000,
        maxRequests: 100,
      };

      const result = await middleware.checkRateLimit('test-key', config);

      expect(result.count).toBe(0);
      expect(result.remaining).toBe(100);
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('createRateLimiter', () => {
    it('should create functional rate limiter', async () => {
      mockRedisService.get.mockResolvedValueOnce('5').mockResolvedValueOnce(Date.now().toString());
      mockRedisService.set.mockResolvedValue(true);

      const rateLimiter = middleware.createRateLimiter('global');

      await rateLimiter(mockRequest, mockResponse, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Rate-Limit-Limit', expect.any(Number));
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Rate-Limit-Remaining', expect.any(Number));
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Rate-Limit-Reset', expect.any(Number));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw exception when limit exceeded', async () => {
      mockRedisService.get.mockResolvedValueOnce('1000').mockResolvedValueOnce(Date.now().toString());
      mockRedisService.set.mockResolvedValue(true);

      const rateLimiter = middleware.createRateLimiter('global');

      await expect(rateLimiter(mockRequest, mockResponse, mockNext))
        .rejects.toThrow(RateLimitExceededException);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(Number));
    });

    it('should use different limits for different configs', async () => {
      mockRedisService.get.mockResolvedValue('1').mockResolvedValue(Date.now().toString());
      mockRedisService.set.mockResolvedValue(true);

      // Test auth limiter (very restrictive)
      const authLimiter = middleware.createRateLimiter('auth');
      await authLimiter(mockRequest, mockResponse, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Rate-Limit-Limit', 5);
    });

    it('should handle unknown config gracefully', async () => {
      const unknownLimiter = middleware.createRateLimiter('unknown-config');

      await unknownLimiter(mockRequest, mockResponse, mockNext);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found')
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('getClientIdentifier', () => {
    it('should use user ID for authenticated requests', () => {
      const request = {
        user: { id: 'user-123' },
        headers: {},
        connection: { remoteAddress: '127.0.0.1' },
      } as any;

      const identifier = (middleware as any).getClientIdentifier(request);
      expect(identifier).toBe('user:user-123');
    });

    it('should use tenant ID when available', () => {
      const request = {
        headers: { 'x-tenant-id': 'tenant-456' },
        connection: { remoteAddress: '127.0.0.1' },
      } as any;

      const identifier = (middleware as any).getClientIdentifier(request);
      expect(identifier).toBe('tenant:tenant-456');
    });

    it('should fallback to IP address', () => {
      const request = {
        headers: {},
        connection: { remoteAddress: '192.168.1.100' },
      } as any;

      const identifier = (middleware as any).getClientIdentifier(request);
      expect(identifier).toBe('ip:192.168.1.100');
    });

    it('should handle forwarded IPs', () => {
      const request = {
        headers: { 'x-forwarded-for': '203.0.113.1, 192.168.1.100' },
        connection: { remoteAddress: '192.168.1.100' },
      } as any;

      const identifier = (middleware as any).getClientIdentifier(request);
      expect(identifier).toBe('ip:203.0.113.1');
    });
  });

  describe('getStats', () => {
    it('should return configuration stats', async () => {
      const stats = await middleware.getStats();

      expect(stats).toHaveProperty('global');
      expect(stats).toHaveProperty('api');
      expect(stats).toHaveProperty('auth');
      expect(stats.global).toHaveProperty('config');
      expect(stats.global).toHaveProperty('status');
    });

    it('should handle errors in stats collection', async () => {
      // Mock an error in one of the configs
      jest.spyOn(middleware as any, 'configs').mockImplementation(() => {
        throw new Error('Config error');
      });

      const stats = await middleware.getStats();

      // Should still return some stats, even with errors
      expect(stats).toBeDefined();
    });
  });

  describe('Integration with Express middleware', () => {
    it('should work as Express middleware', async () => {
      mockRedisService.get.mockResolvedValueOnce('5').mockResolvedValueOnce(Date.now().toString());
      mockRedisService.set.mockResolvedValue(true);

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Rate-Limit-Limit', expect.any(Number));
    });

    it('should handle middleware errors', async () => {
      mockRedisService.get.mockRejectedValue(new Error('Redis error'));

      // Should not throw, but continue with request
      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should handle high request volume', async () => {
      const promises = [];
      const requestCount = 100;

      mockRedisService.get.mockResolvedValue('1').mockResolvedValue(Date.now().toString());
      mockRedisService.set.mockResolvedValue(true);

      const rateLimiter = middleware.createRateLimiter('global');

      // Simulate 100 concurrent requests
      for (let i = 0; i < requestCount; i++) {
        promises.push(rateLimiter(mockRequest, mockResponse, mockNext));
      }

      const startTime = Date.now();
      await Promise.all(promises);
      const duration = Date.now() - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
      expect(mockNext).toHaveBeenCalledTimes(requestCount);
    });

    it('should not leak memory on repeated calls', async () => {
      mockRedisService.get.mockResolvedValue('1').mockResolvedValue(Date.now().toString());
      mockRedisService.set.mockResolvedValue(true);

      const rateLimiter = middleware.createRateLimiter('global');
      const initialMemory = process.memoryUsage().heapUsed;

      // Make many requests
      for (let i = 0; i < 1000; i++) {
        await rateLimiter(mockRequest, mockResponse, mockNext);
        mockNext.mockClear();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      // Memory growth should be minimal (less than 10MB)
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});