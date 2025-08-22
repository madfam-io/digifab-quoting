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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextService = void 0;
var common_1 = require("@nestjs/common");
var async_hooks_1 = require("async_hooks");
var TenantContextService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TenantContextService = _classThis = /** @class */ (function () {
        function TenantContextService_1() {
            this.storage = new async_hooks_1.AsyncLocalStorage();
        }
        /**
         * Run a function with the given tenant context
         */
        TenantContextService_1.prototype.run = function (context, fn) {
            return this.storage.run(context, fn);
        };
        /**
         * Get the current tenant context
         */
        TenantContextService_1.prototype.getContext = function () {
            return this.storage.getStore();
        };
        /**
         * Get the current tenant ID (throws if not in context)
         */
        TenantContextService_1.prototype.getCurrentTenantId = function () {
            var context = this.getContext();
            if (!(context === null || context === void 0 ? void 0 : context.tenantId)) {
                throw new Error('No tenant context available');
            }
            return context.tenantId;
        };
        /**
         * Alias for getCurrentTenantId for backward compatibility
         */
        TenantContextService_1.prototype.getTenantId = function () {
            return this.getCurrentTenantId();
        };
        /**
         * Get the current user ID
         */
        TenantContextService_1.prototype.getCurrentUserId = function () {
            var _a;
            return (_a = this.getContext()) === null || _a === void 0 ? void 0 : _a.userId;
        };
        /**
         * Get the current user roles
         */
        TenantContextService_1.prototype.getCurrentUserRoles = function () {
            var _a;
            return ((_a = this.getContext()) === null || _a === void 0 ? void 0 : _a.userRoles) || [];
        };
        /**
         * Check if the current context has a specific role
         */
        TenantContextService_1.prototype.hasRole = function (role) {
            var roles = this.getCurrentUserRoles();
            return roles.includes(role);
        };
        /**
         * Check if the current context has any of the specified roles
         */
        TenantContextService_1.prototype.hasAnyRole = function (roles) {
            var currentRoles = this.getCurrentUserRoles();
            return roles.some(function (role) { return currentRoles.includes(role); });
        };
        /**
         * Get the current request ID
         */
        TenantContextService_1.prototype.getRequestId = function () {
            var _a;
            return (_a = this.getContext()) === null || _a === void 0 ? void 0 : _a.requestId;
        };
        return TenantContextService_1;
    }());
    __setFunctionName(_classThis, "TenantContextService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TenantContextService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TenantContextService = _classThis;
}();
exports.TenantContextService = TenantContextService;
