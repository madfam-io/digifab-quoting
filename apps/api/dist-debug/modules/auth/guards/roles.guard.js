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
exports.RolesGuard = void 0;
var common_1 = require("@nestjs/common");
var roles_decorator_1 = require("../decorators/roles.decorator");
/**
 * Role hierarchy for permission inheritance
 * Higher roles inherit permissions from lower roles
 */
var ROLE_HIERARCHY = {
    admin: ['admin', 'manager', 'operator', 'support', 'customer'],
    manager: ['manager', 'operator', 'support', 'customer'],
    operator: ['operator', 'support', 'customer'],
    support: ['support', 'customer'],
    customer: ['customer'],
};
var RolesGuard = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RolesGuard = _classThis = /** @class */ (function () {
        function RolesGuard_1(reflector, tenantContext) {
            this.reflector = reflector;
            this.tenantContext = tenantContext;
        }
        RolesGuard_1.prototype.canActivate = function (context) {
            var requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            // If no roles are required, allow access
            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }
            var request = context.switchToHttp().getRequest();
            var user = request.user;
            // Check if user is authenticated
            if (!user) {
                throw new common_1.ForbiddenException('User not authenticated');
            }
            // Get user roles from JWT and tenant context
            var userRoles = user.roles || [];
            var contextRoles = this.tenantContext.getCurrentUserRoles();
            // Combine roles from both sources
            var allUserRoles = __spreadArray([], new Set(__spreadArray(__spreadArray([], userRoles, true), contextRoles, true)), true);
            // Check if user has any of the required roles (considering hierarchy)
            var hasRequiredRole = requiredRoles.some(function (requiredRole) {
                return allUserRoles.some(function (userRole) { var _a; return (_a = ROLE_HIERARCHY[userRole]) === null || _a === void 0 ? void 0 : _a.includes(requiredRole); });
            });
            if (!hasRequiredRole) {
                throw new common_1.ForbiddenException("Access denied. Required roles: ".concat(requiredRoles.join(', '), ". User roles: ").concat(allUserRoles.join(', ')));
            }
            return true;
        };
        return RolesGuard_1;
    }());
    __setFunctionName(_classThis, "RolesGuard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RolesGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RolesGuard = _classThis;
}();
exports.RolesGuard = RolesGuard;
