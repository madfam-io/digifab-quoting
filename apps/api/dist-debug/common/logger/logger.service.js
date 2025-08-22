"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.LoggerService = void 0;
var common_1 = require("@nestjs/common");
var winston_config_1 = require("./winston.config");
var error_handling_1 = require("../utils/error-handling");
var LoggerService = function () {
    var _classDecorators = [(0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LoggerService = _classThis = /** @class */ (function () {
        function LoggerService_1(tenantContext) {
            this.tenantContext = tenantContext;
            this.logger = (0, winston_config_1.createWinstonLogger)();
        }
        LoggerService_1.prototype.setContext = function (context) {
            this.context = context;
        };
        LoggerService_1.prototype.log = function (message, context) {
            var meta = this.buildMetadata(context);
            this.logger.info(message, meta);
        };
        LoggerService_1.prototype.error = function (message, trace, context) {
            var errorMessage;
            var errorStack;
            var errorMeta;
            // Handle different parameter combinations
            if (message instanceof Error) {
                errorMessage = message.message;
                errorStack = message.stack;
                errorMeta = __assign(__assign({}, this.buildMetadata(context)), { error: true, stack: errorStack, originalError: (0, error_handling_1.formatErrorForLogging)(message) });
            }
            else if (typeof trace === 'string') {
                errorMessage = message;
                errorStack = trace;
                errorMeta = __assign(__assign({}, this.buildMetadata(context)), { error: true, stack: errorStack });
            }
            else if (trace instanceof Error) {
                errorMessage = message;
                errorStack = trace.stack;
                errorMeta = __assign(__assign({}, this.buildMetadata(context)), { error: true, stack: errorStack, originalError: (0, error_handling_1.formatErrorForLogging)(trace) });
            }
            else {
                errorMessage = message;
                errorMeta = __assign(__assign({}, this.buildMetadata(context)), { error: true });
            }
            this.logger.error(errorMessage, errorMeta);
        };
        LoggerService_1.prototype.warn = function (message, context) {
            var meta = this.buildMetadata(context);
            this.logger.warn(message, meta);
        };
        LoggerService_1.prototype.debug = function (message, context) {
            var meta = this.buildMetadata(context);
            this.logger.debug(message, meta);
        };
        LoggerService_1.prototype.verbose = function (message, context) {
            var meta = this.buildMetadata(context);
            this.logger.verbose(message, meta);
        };
        /**
         * Custom method for HTTP logging
         */
        LoggerService_1.prototype.http = function (message, meta) {
            var context = this.tenantContext.getContext();
            var logMeta = __assign(__assign({}, meta), { context: this.context, tenantId: context === null || context === void 0 ? void 0 : context.tenantId, userId: context === null || context === void 0 ? void 0 : context.userId, requestId: context === null || context === void 0 ? void 0 : context.requestId });
            this.logger.http(message, logMeta);
        };
        /**
         * Custom method for audit logging
         */
        LoggerService_1.prototype.audit = function (action, entity, entityId, meta) {
            var context = this.tenantContext.getContext();
            var logMeta = __assign(__assign({ audit: true, action: action, entity: entity, entityId: entityId }, meta), { context: this.context, tenantId: context === null || context === void 0 ? void 0 : context.tenantId, userId: context === null || context === void 0 ? void 0 : context.userId, requestId: context === null || context === void 0 ? void 0 : context.requestId });
            this.logger.info('Audit log', logMeta);
        };
        /**
         * Custom method for security logging
         */
        LoggerService_1.prototype.security = function (event, meta) {
            var context = this.tenantContext.getContext();
            var logMeta = __assign(__assign({ security: true, event: event }, meta), { context: this.context, tenantId: context === null || context === void 0 ? void 0 : context.tenantId, userId: context === null || context === void 0 ? void 0 : context.userId, requestId: context === null || context === void 0 ? void 0 : context.requestId });
            this.logger.warn('Security event', logMeta);
        };
        /**
         * Custom method for performance logging
         */
        LoggerService_1.prototype.performance = function (operation, duration, meta) {
            var context = this.tenantContext.getContext();
            var logMeta = __assign(__assign({ performance: true, operation: operation, duration: duration }, meta), { context: this.context, tenantId: context === null || context === void 0 ? void 0 : context.tenantId, userId: context === null || context === void 0 ? void 0 : context.userId, requestId: context === null || context === void 0 ? void 0 : context.requestId });
            this.logger.info('Performance metric', logMeta);
        };
        LoggerService_1.prototype.buildMetadata = function (contextOrMeta) {
            var tenantContext = this.tenantContext.getContext();
            var baseMetadata = {
                context: this.context,
                tenantId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.tenantId,
                userId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.userId,
                requestId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.requestId,
                timestamp: new Date().toISOString(),
            };
            if (typeof contextOrMeta === 'string') {
                return __assign(__assign({}, baseMetadata), { context: contextOrMeta });
            }
            else if (contextOrMeta) {
                return __assign(__assign({}, baseMetadata), contextOrMeta);
            }
            return baseMetadata;
        };
        return LoggerService_1;
    }());
    __setFunctionName(_classThis, "LoggerService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LoggerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LoggerService = _classThis;
}();
exports.LoggerService = LoggerService;
