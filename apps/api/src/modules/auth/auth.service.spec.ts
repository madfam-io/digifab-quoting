import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../redis/cache.service';
import { USER_ROLES } from '@cotiza/shared';

// Mock bcrypt module
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    tenantId: 'tenant-123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER',
    roles: [USER_ROLES.CUSTOMER],
    active: true,
    passwordHash: '$2a$10$mockHashedPassword',
    lastLogin: null,
  };

  // const _mockTokens = {
  //   accessToken: 'mock-access-token',
  //   refreshToken: 'mock-refresh-token',
  //   expiresIn: 900,
  // };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            updateLastLogin: jest.fn(),
          },
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
        {
          provide: PrismaService,
          useValue: {
            session: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              deleteMany: jest.fn(),
              findFirst: jest.fn(),
            },
            tenant: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            user: {
              create: jest.fn(),
            },
            customer: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: CacheService,
          useValue: {
            cacheUserSession: jest.fn(),
            invalidate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    // Setup default mocks
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (configService.get as jest.Mock).mockReturnValue(3600);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        tenantId: mockUser.tenantId,
        name: 'John Doe',
        roles: mockUser.roles,
        active: mockUser.active,
        lastLogin: undefined,
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate tokens and create session', async () => {
      const user = {
        id: mockUser.id,
        email: mockUser.email,
        tenantId: mockUser.tenantId,
        name: 'John Doe',
        roles: mockUser.roles,
        active: mockUser.active,
        lastLogin: undefined,
      };

      (jwtService.sign as jest.Mock).mockReturnValueOnce('access-token');
      (jwtService.sign as jest.Mock).mockReturnValueOnce('refresh-token');
      (prismaService.session.create as jest.Mock).mockResolvedValue({});

      const result = await service.login(user);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');

      expect(prismaService.session.create).toHaveBeenCalled();
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(user.id);
    });
  });

  describe('refreshTokens', () => {
    it('should generate new tokens when refresh token is valid', async () => {
      const mockSession = {
        id: 'session-123',
        refreshToken: 'old-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        user: mockUser,
      };

      (jwtService.verify as jest.Mock).mockReturnValue({ sub: mockUser.id });
      (prismaService.session.findUnique as jest.Mock).mockResolvedValue(mockSession);
      (jwtService.sign as jest.Mock).mockReturnValueOnce('new-access-token');
      (jwtService.sign as jest.Mock).mockReturnValueOnce('new-refresh-token');
      (prismaService.session.update as jest.Mock).mockResolvedValue({});

      const result = await service.refreshTokens('old-refresh-token');

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
      expect(prismaService.session.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when session not found', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: mockUser.id });
      (prismaService.session.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.refreshTokens('token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when session is expired', async () => {
      const expiredSession = {
        id: 'session-123',
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() - 3600000), // Expired
        user: mockUser,
      };

      (jwtService.verify as jest.Mock).mockReturnValue({ sub: mockUser.id });
      (prismaService.session.findUnique as jest.Mock).mockResolvedValue(expiredSession);

      await expect(service.refreshTokens('refresh-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      company: 'ACME Corp',
      phone: '+1234567890',
    };

    it('should create user and return tokens', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (prismaService.tenant.findFirst as jest.Mock).mockResolvedValue({
        id: 'tenant-123',
      });
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
      });
      (prismaService.customer.create as jest.Mock).mockResolvedValue({});
      (jwtService.sign as jest.Mock).mockReturnValueOnce('access-token');
      (jwtService.sign as jest.Mock).mockReturnValueOnce('refresh-token');
      (prismaService.session.create as jest.Mock).mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(prismaService.customer.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should create default tenant if not exists', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (prismaService.tenant.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.tenant.create as jest.Mock).mockResolvedValue({
        id: 'new-tenant-123',
      });
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
      });
      (prismaService.customer.create as jest.Mock).mockResolvedValue({});
      (jwtService.sign as jest.Mock).mockReturnValue('token');
      (prismaService.session.create as jest.Mock).mockResolvedValue({});

      await service.register(registerDto);

      expect(prismaService.tenant.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: registerDto.company,
          domain: 'default',
        }),
      });
    });
  });

  describe('logout', () => {
    it('should delete session', async () => {
      (prismaService.session.deleteMany as jest.Mock).mockResolvedValue({});

      await service.logout('access-token');

      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { token: 'access-token' },
      });
    });
  });
});
