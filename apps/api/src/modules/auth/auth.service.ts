import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../redis/cache.service';
import { AuthTokens, JWTPayload, User, UserRole } from '@cotiza/shared';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash: _, ...result } = user;
      return {
        id: result.id,
        tenantId: result.tenantId,
        email: result.email,
        name: `${result.firstName} ${result.lastName}`.trim(),
        roles: [result.role.toLowerCase() as UserRole],
        active: result.active,
        lastLogin: result.lastLogin?.toISOString(),
      } as User;
    }
    return null;
  }

  async login(user: User): Promise<AuthTokens> {
    const tokens = await this.generateTokens(user);

    // Store session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(
          Date.now() + (this.configService.get<number>('jwt.refreshTokenExpiry') || 86400) * 1000,
        ),
      },
    });

    // Cache user session for performance
    const sessionData = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
      lastLogin: new Date(),
      lastActivity: new Date(),
    };
    await this.cacheService.cacheUserSession(user.id, sessionData);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return tokens;
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.secret'),
      });

      // Check if session exists
      const session = await this.prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const user: User = {
        id: session.user.id,
        tenantId: session.user.tenantId,
        email: session.user.email,
        name: `${session.user.firstName} ${session.user.lastName}`.trim(),
        roles: [session.user.role.toLowerCase() as UserRole],
        active: session.user.active,
        lastLogin: session.user.lastLogin?.toISOString(),
      };
      const tokens = await this.generateTokens(user);

      // Update session
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(
            Date.now() + (this.configService.get<number>('jwt.refreshTokenExpiry') || 86400) * 1000,
          ),
        },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(token: string): Promise<void> {
    // Find session to get user ID
    const session = await this.prisma.session.findFirst({
      where: { token },
    });

    if (session) {
      // Clear cached session
      await this.cacheService.invalidate(`session:${session.userId}`);
    }

    // Delete session from database
    await this.prisma.session.deleteMany({
      where: { token },
    });
  }

  async register(registerDto: RegisterDto): Promise<AuthTokens & { user: User }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate tenant if provided
    let tenantId = registerDto.tenantId;
    if (!tenantId) {
      // For MVP, use a default tenant or create one
      const defaultTenant = await this.prisma.tenant.findFirst({
        where: { domain: 'default' },
      });

      if (!defaultTenant) {
        // Create default tenant for MVP
        const tenant = await this.prisma.tenant.create({
          data: {
            code: 'DEFAULT',
            name: registerDto.company || 'Default Company',
            domain: 'default',
            settings: {},
          },
        });
        tenantId = tenant.id;
      } else {
        tenantId = defaultTenant.id;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: 'CUSTOMER',
        tenantId,
        emailVerified: false,
      },
    });

    // Create customer record
    await this.prisma.customer.create({
      data: {
        userId: user.id,
        tenantId,
        company: registerDto.company,
        billingAddress: {},
        shippingAddress: {},
      },
    });

    // Generate tokens and login
    const { passwordHash: _, ...userWithoutPassword } = user;
    const userForLogin: User = {
      id: userWithoutPassword.id,
      tenantId: userWithoutPassword.tenantId,
      email: userWithoutPassword.email,
      name: `${userWithoutPassword.firstName} ${userWithoutPassword.lastName}`.trim(),
      roles: [userWithoutPassword.role.toLowerCase() as UserRole],
      active: userWithoutPassword.active,
      lastLogin: userWithoutPassword.lastLogin?.toISOString(),
    };
    const tokens = await this.login(userForLogin);

    return {
      ...tokens,
      user: userForLogin,
    };
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.refreshTokenExpiry') || '1d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
