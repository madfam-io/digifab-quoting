"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = exports.RequirePermissions = exports.PERMISSIONS_KEY = exports.Permission = void 0;
var common_1 = require("@nestjs/common");
/**
 * Define permissions for each role
 * This can be extended to support more granular permissions
 */
var Permission;
(function (Permission) {
    // Quote permissions
    Permission["QUOTE_CREATE"] = "quote:create";
    Permission["QUOTE_READ"] = "quote:read";
    Permission["QUOTE_UPDATE"] = "quote:update";
    Permission["QUOTE_DELETE"] = "quote:delete";
    Permission["QUOTE_APPROVE"] = "quote:approve";
    Permission["QUOTE_EXPORT"] = "quote:export";
    // Customer permissions
    Permission["CUSTOMER_CREATE"] = "customer:create";
    Permission["CUSTOMER_READ"] = "customer:read";
    Permission["CUSTOMER_UPDATE"] = "customer:update";
    Permission["CUSTOMER_DELETE"] = "customer:delete";
    // Admin permissions
    Permission["ADMIN_CONFIG_READ"] = "admin:config:read";
    Permission["ADMIN_CONFIG_WRITE"] = "admin:config:write";
    Permission["ADMIN_USER_MANAGE"] = "admin:user:manage";
    Permission["ADMIN_TENANT_MANAGE"] = "admin:tenant:manage";
    // Pricing permissions
    Permission["PRICING_READ"] = "pricing:read";
    Permission["PRICING_WRITE"] = "pricing:write";
    Permission["PRICING_OVERRIDE"] = "pricing:override";
    // Report permissions
    Permission["REPORT_VIEW"] = "report:view";
    Permission["REPORT_EXPORT"] = "report:export";
    Permission["REPORT_FINANCIAL"] = "report:financial";
    // Audit permissions
    Permission["AUDIT_READ"] = "audit:read";
    Permission["AUDIT_EXPORT"] = "audit:export";
})(Permission || (exports.Permission = Permission = {}));
// Role to permissions mapping
var ROLE_PERMISSIONS = {
    admin: __spreadArray([], Object.values(Permission), true),
    manager: [
        // Quote permissions
        Permission.QUOTE_CREATE,
        Permission.QUOTE_READ,
        Permission.QUOTE_UPDATE,
        Permission.QUOTE_DELETE,
        Permission.QUOTE_APPROVE,
        Permission.QUOTE_EXPORT,
        // Customer permissions
        Permission.CUSTOMER_CREATE,
        Permission.CUSTOMER_READ,
        Permission.CUSTOMER_UPDATE,
        // Pricing permissions
        Permission.PRICING_READ,
        Permission.PRICING_WRITE,
        Permission.PRICING_OVERRIDE,
        // Report permissions
        Permission.REPORT_VIEW,
        Permission.REPORT_EXPORT,
        Permission.REPORT_FINANCIAL,
        // Audit permissions
        Permission.AUDIT_READ,
    ],
    operator: [
        // Quote permissions
        Permission.QUOTE_CREATE,
        Permission.QUOTE_READ,
        Permission.QUOTE_UPDATE,
        Permission.QUOTE_EXPORT,
        // Customer permissions
        Permission.CUSTOMER_READ,
        Permission.CUSTOMER_UPDATE,
        // Pricing permissions
        Permission.PRICING_READ,
        // Report permissions
        Permission.REPORT_VIEW,
    ],
    support: [
        // Quote permissions
        Permission.QUOTE_READ,
        // Customer permissions
        Permission.CUSTOMER_READ,
        // Report permissions
        Permission.REPORT_VIEW,
    ],
    customer: [
        // Customers can only read their own quotes
        Permission.QUOTE_CREATE,
        Permission.QUOTE_READ,
    ],
};
exports.PERMISSIONS_KEY = 'permissions';
var RequirePermissions = function () {
    var permissions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        permissions[_i] = arguments[_i];
    }
    return (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
};
exports.RequirePermissions = RequirePermissions;
var PermissionsGuard = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PermissionsGuard = _classThis = /** @class */ (function () {
        function PermissionsGuard_1(reflector) {
            this.reflector = reflector;
        }
        PermissionsGuard_1.prototype.canActivate = function (context) {
            var requiredPermissions = this.reflector.getAllAndOverride(exports.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
            if (!requiredPermissions || requiredPermissions.length === 0) {
                return true;
            }
            var request = context.switchToHttp().getRequest();
            var user = request.user;
            if (!user) {
                throw new common_1.ForbiddenException('User not authenticated');
            }
            var userRoles = user.roles || [];
            var userPermissions = new Set();
            // Collect all permissions for user's roles
            userRoles.forEach(function (role) {
                var rolePermissions = ROLE_PERMISSIONS[role] || [];
                rolePermissions.forEach(function (permission) { return userPermissions.add(permission); });
            });
            // Check if user has all required permissions
            var hasAllPermissions = requiredPermissions.every(function (permission) {
                return userPermissions.has(permission);
            });
            if (!hasAllPermissions) {
                var missingPermissions = requiredPermissions.filter(function (p) { return !userPermissions.has(p); });
                throw new common_1.ForbiddenException("Access denied. Missing permissions: ".concat(missingPermissions.join(', ')));
            }
            return true;
        };
        return PermissionsGuard_1;
    }());
    __setFunctionName(_classThis, "PermissionsGuard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PermissionsGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PermissionsGuard = _classThis;
}();
exports.PermissionsGuard = PermissionsGuard;
