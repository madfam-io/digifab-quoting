"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalOnly = exports.Authenticated = exports.SupportOrHigher = exports.OperatorOrHigher = exports.ManagerOrHigher = exports.AdminOnly = void 0;
var common_1 = require("@nestjs/common");
var shared_1 = require("@madfam/shared");
var jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
var roles_guard_1 = require("../guards/roles.guard");
var roles_decorator_1 = require("./roles.decorator");
/**
 * Decorator for admin-only endpoints
 * Combines JWT authentication and admin role requirement
 */
var AdminOnly = function () { return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(shared_1.USER_ROLES.ADMIN)); };
exports.AdminOnly = AdminOnly;
/**
 * Decorator for manager or higher role endpoints
 * Includes: Admin, Manager
 */
var ManagerOrHigher = function () { return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(shared_1.USER_ROLES.MANAGER)); };
exports.ManagerOrHigher = ManagerOrHigher;
/**
 * Decorator for operator or higher role endpoints
 * Includes: Admin, Manager, Operator
 */
var OperatorOrHigher = function () { return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(shared_1.USER_ROLES.OPERATOR)); };
exports.OperatorOrHigher = OperatorOrHigher;
/**
 * Decorator for support or higher role endpoints
 * Includes: Admin, Manager, Operator, Support
 */
var SupportOrHigher = function () { return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(shared_1.USER_ROLES.SUPPORT)); };
exports.SupportOrHigher = SupportOrHigher;
/**
 * Decorator for authenticated users (any role)
 * Just requires valid JWT token
 */
var Authenticated = function () { return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)); };
exports.Authenticated = Authenticated;
/**
 * Decorator for internal staff only (excludes customers)
 * Includes: Admin, Manager, Operator, Support
 */
var InternalOnly = function () { return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(shared_1.USER_ROLES.SUPPORT)); };
exports.InternalOnly = InternalOnly;
