import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Janua JWT Payload structure
 * Matches the token format issued by Janua auth service
 */
export interface JanuaJWTPayload {
  sub: string; // User ID
  email: string;
  org_id?: string; // Organization/Tenant ID
  roles?: string[];
  permissions?: string[];
  iss: string; // Should be 'janua'
  iat: number;
  exp: number;
}

/**
 * Normalized user object for use throughout Cotiza
 */
export interface JanuaUser {
  id: string;
  email: string;
  tenantId: string | null;
  roles: string[];
  permissions: string[];
  active: boolean;
}

// Valid issuers from Janua auth service
const JANUA_VALID_ISSUERS = ['janua', 'https://janua.dev', 'http://localhost:8001'];

@Injectable()
export class JanuaJwtStrategy extends PassportStrategy(Strategy, 'janua-jwt') {
  private readonly logger = new Logger(JanuaJwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JANUA_JWT_SECRET') || configService.get('jwt.secret'),
      // Don't validate issuer in passport - we'll do it manually to support multiple issuers
    });

    this.logger.log('Janua JWT Strategy initialized');
  }

  /**
   * Validate Janua JWT token and transform to Cotiza user format
   */
  async validate(payload: JanuaJWTPayload): Promise<JanuaUser> {
    // Validate required fields
    if (!payload.sub) {
      this.logger.warn('Token missing subject (sub) claim');
      throw new UnauthorizedException('Invalid token: missing user identifier');
    }

    // Validate issuer - accept multiple valid issuers from Janua
    if (!JANUA_VALID_ISSUERS.includes(payload.iss)) {
      this.logger.warn(
        `Invalid token issuer: ${payload.iss}. Expected one of: ${JANUA_VALID_ISSUERS.join(', ')}`,
      );
      throw new UnauthorizedException('Invalid token: incorrect issuer');
    }

    // Transform Janua payload to Cotiza user format
    const user: JanuaUser = {
      id: payload.sub,
      email: payload.email,
      tenantId: payload.org_id || null,
      roles: payload.roles || ['user'],
      permissions: payload.permissions || [],
      active: true,
    };

    this.logger.debug(`Authenticated user: ${user.email} (${user.id})`);
    return user;
  }
}
