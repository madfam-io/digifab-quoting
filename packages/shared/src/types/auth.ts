import { UUID } from './common';

export type UserRole = 'admin' | 'manager' | 'operator' | 'support' | 'customer';

export interface User {
  id: UUID;
  tenantId: UUID;
  email: string;
  name?: string;
  roles: UserRole[];
  active: boolean;
  lastLogin?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  sub: UUID;
  email: string;
  tenantId: UUID;
  roles: UserRole[];
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: UUID;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  tenantId: UUID;
}