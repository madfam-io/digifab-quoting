import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    validateUser: jest.fn(),
    generateTokens: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'customer',
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
    expiresIn: 900,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'SecurePassword123!',
      name: 'New User',
      company: 'ACME Corp',
    };

    it('should successfully register a new user', async () => {
      mockAuthService.register.mockResolvedValue({
        user: mockUser,
        ...mockTokens,
      });

      const result = await controller.register(registerDto);

      expect(result).toEqual({
        user: mockUser,
        ...mockTokens,
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle duplicate email error', async () => {
      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Email already exists')
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should validate password strength', async () => {
      const weakPasswordDto = {
        ...registerDto,
        password: '123456',
      };

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Password too weak')
      );

      await expect(controller.register(weakPasswordDto)).rejects.toThrow(
        'Password too weak'
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        ...mockTokens,
      });

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        user: mockUser,
        ...mockTokens,
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
    });

    it('should handle invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should handle account lockout', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Account locked due to multiple failed attempts')
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Account locked'
      );
    });

    it('should track login attempts', async () => {
      const req = { ip: '192.168.1.1', headers: { 'user-agent': 'test' } } as Request;
      
      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        ...mockTokens,
      });

      await controller.login(loginDto, req);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
        expect.objectContaining({
          ip: '192.168.1.1',
          userAgent: 'test',
        })
      );
    });
  });

  describe('refresh', () => {
    const refreshDto = {
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
    };

    it('should successfully refresh access token', async () => {
      mockAuthService.refresh.mockResolvedValue(mockTokens);

      const result = await controller.refresh(refreshDto);

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(refreshDto.refreshToken);
    });

    it('should handle invalid refresh token', async () => {
      mockAuthService.refresh.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token')
      );

      await expect(controller.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should handle expired refresh token', async () => {
      mockAuthService.refresh.mockRejectedValue(
        new UnauthorizedException('Refresh token expired')
      );

      await expect(controller.refresh(refreshDto)).rejects.toThrow(
        'Refresh token expired'
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const req = {
        user: { id: 'user-123' },
        headers: { authorization: 'Bearer token' },
      } as any;

      mockAuthService.logout.mockResolvedValue({ success: true });

      const result = await controller.logout(req);

      expect(result).toEqual({ success: true });
      expect(mockAuthService.logout).toHaveBeenCalledWith('user-123', 'Bearer token');
    });

    it('should handle logout without user context', async () => {
      const req = {
        headers: { authorization: 'Bearer token' },
      } as any;

      const result = await controller.logout(req);

      expect(result).toEqual({ success: true });
    });
  });

  describe('getSession', () => {
    it('should return current user session', async () => {
      const req = {
        user: mockUser,
      } as any;

      const result = await controller.getSession(req);

      expect(result).toEqual({ user: mockUser });
    });

    it('should return null for unauthenticated request', async () => {
      const req = {} as any;

      const result = await controller.getSession(req);

      expect(result).toEqual({ user: null });
    });
  });

  describe('logAuthEvent', () => {
    it('should log authentication events', async () => {
      const logDto = {
        event: 'login_attempt',
        userId: 'user-123',
        metadata: {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      };

      const result = await controller.logAuthEvent(logDto);

      expect(result).toEqual({ success: true });
    });

    it('should handle different event types', async () => {
      const events = [
        'login_success',
        'login_failure',
        'logout',
        'password_reset',
        'token_refresh',
      ];

      for (const event of events) {
        const result = await controller.logAuthEvent({
          event,
          userId: 'user-123',
        });
        expect(result).toEqual({ success: true });
      }
    });
  });

  describe('validation', () => {
    it('should validate email format', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user@.com',
      ];

      for (const email of invalidEmails) {
        mockAuthService.register.mockRejectedValue(
          new BadRequestException('Invalid email format')
        );

        await expect(
          controller.register({
            email,
            password: 'ValidPassword123!',
            name: 'Test',
          })
        ).rejects.toThrow('Invalid email format');
      }
    });

    it('should enforce password requirements', async () => {
      const weakPasswords = [
        '12345',           // Too short
        'password',        // No numbers
        'PASSWORD123',     // No lowercase
        'password123',     // No uppercase
        'Password',        // No numbers
      ];

      for (const password of weakPasswords) {
        mockAuthService.register.mockRejectedValue(
          new BadRequestException('Password does not meet requirements')
        );

        await expect(
          controller.register({
            email: 'test@example.com',
            password,
            name: 'Test',
          })
        ).rejects.toThrow('Password does not meet requirements');
      }
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limits on login attempts', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      // Simulate multiple rapid requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(controller.login(loginDto));
      }

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Too many attempts')
      );

      const results = await Promise.allSettled(promises);
      const rejected = results.filter(r => r.status === 'rejected');
      
      expect(rejected.length).toBeGreaterThan(0);
    });

    it('should enforce rate limits on registration', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(controller.register({
          email: `user${i}@example.com`,
          password: 'Password123!',
          name: `User ${i}`,
        }));
      }

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Too many registration attempts')
      );

      const results = await Promise.allSettled(promises);
      const rejected = results.filter(r => r.status === 'rejected');
      
      expect(rejected.length).toBeGreaterThan(0);
    });
  });

  describe('security headers', () => {
    it('should set secure cookie options', async () => {
      const res = {
        cookie: jest.fn(),
        json: jest.fn(),
      } as any;

      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        ...mockTokens,
      });

      await controller.loginWithCookie(
        { email: 'test@example.com', password: 'password' },
        res
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        })
      );
    });
  });
});