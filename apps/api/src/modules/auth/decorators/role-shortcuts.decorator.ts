import { applyDecorators, UseGuards } from '@nestjs/common';
import { USER_ROLES } from '@cotiza/shared';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Decorator for admin-only endpoints
 * Combines JWT authentication and admin role requirement
 */
export const AdminOnly = () =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(USER_ROLES.ADMIN));

/**
 * Decorator for manager or higher role endpoints
 * Includes: Admin, Manager
 */
export const ManagerOrHigher = () =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(USER_ROLES.MANAGER));

/**
 * Decorator for operator or higher role endpoints
 * Includes: Admin, Manager, Operator
 */
export const OperatorOrHigher = () =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(USER_ROLES.OPERATOR));

/**
 * Decorator for support or higher role endpoints
 * Includes: Admin, Manager, Operator, Support
 */
export const SupportOrHigher = () =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(USER_ROLES.SUPPORT));

/**
 * Decorator for authenticated users (any role)
 * Just requires valid JWT token
 */
export const Authenticated = () => applyDecorators(UseGuards(JwtAuthGuard));

/**
 * Decorator for internal staff only (excludes customers)
 * Includes: Admin, Manager, Operator, Support
 */
export const InternalOnly = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(USER_ROLES.SUPPORT), // Since support is lowest internal role, hierarchy will allow all internal roles
  );
