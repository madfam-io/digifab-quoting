import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthTokens, JWTPayload, User, UserRole } from '@madfam/shared';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.passwordHash && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result as User;
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
        expiresAt: new Date(Date.now() + this.configService.get<number>('jwt.refreshTokenExpiry') * 1000),
      },
    });

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return tokens;
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
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
      const tokens = await this.generateTokens(session.user as User);

      // Update session
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + this.configService.get<number>('jwt.refreshTokenExpiry') * 1000),
        },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(token: string): Promise<void> {
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
            name: registerDto.company,
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
        role: UserRole.CUSTOMER,
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
    const tokens = await this.login(userWithoutPassword as User);

    return {
      ...tokens,
      user: userWithoutPassword as User,
    };
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.refreshTokenExpiry'),
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