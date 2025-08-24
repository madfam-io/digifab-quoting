import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { LoggerService } from '@/common/logger/logger.service';

jest.mock('ioredis');

describe('RedisService', () => {
  let service: RedisService;
  let mockRedisClient: jest.Mocked<Redis>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockLoggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    // Create mock Redis client
    mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
      expire: jest.fn(),
      flushall: jest.fn(),
      call: jest.fn(),
      status: 'ready',
      on: jest.fn(),
    } as any;

    (Redis as any).mockImplementation(() => mockRedisClient);

    mockConfigService = {
      get: jest.fn().mockReturnValue('redis://localhost:6379'),
    } as any;

    mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<LoggerService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
    jest.clearAllMocks();
  });

  describe('generateKey', () => {
    it('should generate key without tenant ID', () => {
      const key = service.generateKey({
        prefix: 'test',
        identifier: 'item1',
      });
      expect(key).toBe('test:item1');
    });

    it('should generate key with tenant ID', () => {
      const key = service.generateKey({
        prefix: 'test',
        identifier: 'item1',
        tenantId: 'tenant123',
      });
      expect(key).toBe('test:tenant:tenant123:item1');
    });

    it('should handle array identifiers', () => {
      const key = service.generateKey({
        prefix: 'test',
        identifier: ['item1', 'item2'],
        tenantId: 'tenant123',
      });
      expect(key).toBe('test:tenant:tenant123:item1:item2');
    });
  });

  describe('get', () => {
    it('should return cached value', async () => {
      const mockData = { test: 'data' };
      const cacheEntry = {
        data: mockData,
        metadata: { createdAt: Date.now() },
      };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cacheEntry));

      const result = await service.get('test:key');
      expect(result).toEqual(mockData);
      expect(service.getStatistics().hits).toBe(1);
    });

    it('should return null for missing key', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get('test:key');
      expect(result).toBeNull();
      expect(service.getStatistics().misses).toBe(1);
    });

    it('should handle expired entries', async () => {
      const cacheEntry = {
        data: { test: 'data' },
        metadata: {
          createdAt: Date.now() - 3600000,
          expiresAt: Date.now() - 1000, // Expired
        },
      };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cacheEntry));
      mockRedisClient.del.mockResolvedValue(1);

      const result = await service.get('test:key');
      expect(result).toBeNull();
      expect(mockRedisClient.del).toHaveBeenCalledWith('test:key');
      expect(service.getStatistics().misses).toBe(1);
    });

    it('should handle errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.get('test:key');
      expect(result).toBeNull();
      expect(service.getStatistics().errors).toBe(1);
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      const result = await service.set('test:key', { test: 'data' });
      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalled();
      expect(service.getStatistics().sets).toBe(1);
    });

    it('should set value with TTL', async () => {
      mockRedisClient.setex.mockResolvedValue('OK');

      const result = await service.set('test:key', { test: 'data' }, 300);
      expect(result).toBe(true);
      expect(mockRedisClient.setex).toHaveBeenCalledWith('test:key', 300, expect.any(String));
      expect(service.getStatistics().sets).toBe(1);
    });

    it('should handle errors gracefully', async () => {
      mockRedisClient.set.mockRejectedValue(new Error('Redis error'));

      const result = await service.set('test:key', { test: 'data' });
      expect(result).toBe(false);
      expect(service.getStatistics().errors).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete single key', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      const result = await service.delete('test:key');
      expect(result).toBe(1);
      expect(service.getStatistics().deletes).toBe(1);
    });

    it('should delete multiple keys', async () => {
      mockRedisClient.del.mockResolvedValue(3);

      const result = await service.delete(['key1', 'key2', 'key3']);
      expect(result).toBe(3);
      expect(service.getStatistics().deletes).toBe(3);
    });
  });

  describe('deletePattern', () => {
    it('should delete keys matching pattern', async () => {
      mockRedisClient.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      mockRedisClient.del.mockResolvedValue(3);

      const result = await service.deletePattern('test:*');
      expect(result).toBe(3);
      expect(mockRedisClient.keys).toHaveBeenCalledWith('test:*');
    });

    it('should return 0 when no keys match', async () => {
      mockRedisClient.keys.mockResolvedValue([]);

      const result = await service.deletePattern('test:*');
      expect(result).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should calculate hit rate correctly', async () => {
      // Generate some hits and misses
      mockRedisClient.get.mockResolvedValueOnce(
        JSON.stringify({
          data: 'test',
          metadata: { createdAt: Date.now() },
        }),
      );
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockRedisClient.get.mockResolvedValueOnce(null);

      await service.get('key1'); // Hit
      await service.get('key2'); // Miss
      await service.get('key3'); // Miss

      const stats = service.getStatistics();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBeCloseTo(33.33, 1);
    });

    it('should reset statistics', () => {
      service.resetStatistics();
      const stats = service.getStatistics();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.sets).toBe(0);
      expect(stats.deletes).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('connection management', () => {
    it('should report connection status', () => {
      expect(service.isConnected()).toBe(true);
    });

    it('should handle connection errors', async () => {
      const errorRedisClient = {
        ...mockRedisClient,
        connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
      };

      (Redis as any).mockImplementation(() => errorRedisClient as any);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RedisService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: LoggerService, useValue: mockLoggerService },
        ],
      }).compile();

      const errorService = module.get<RedisService>(RedisService);
      await errorService.onModuleInit();

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Failed to connect to Redis',
        expect.any(Error),
      );
    });
  });
});
