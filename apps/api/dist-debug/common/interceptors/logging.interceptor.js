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
exports.LoggingInterceptor = void 0;
var common_1 = require("@nestjs/common");
var operators_1 = require("rxjs/operators");
var LoggingInterceptor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LoggingInterceptor = _classThis = /** @class */ (function () {
        function LoggingInterceptor_1(tenantContext) {
            this.tenantContext = tenantContext;
            this.logger = new common_1.Logger('HTTP');
        }
        LoggingInterceptor_1.prototype.intercept = function (context, next) {
            var _this = this;
            var ctx = context.switchToHttp();
            var request = ctx.getRequest();
            var response = ctx.getResponse();
            var tenantContext = this.tenantContext.getContext();
            var method = request.method, url = request.url, body = request.body, query = request.query, params = request.params;
            var userAgent = request.get('user-agent') || '';
            var ip = request.ip;
            var now = Date.now();
            // Log request
            this.logger.log("".concat(method, " ").concat(url, " - Request"), {
                tenantId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.tenantId,
                userId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.userId,
                requestId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.requestId,
                ip: ip,
                userAgent: userAgent,
                body: this.sanitizeBody(body),
                query: query,
                params: params,
            });
            return next.handle().pipe((0, operators_1.tap)({
                next: function (data) {
                    var responseTime = Date.now() - now;
                    var statusCode = response.statusCode;
                    // Log successful response
                    _this.logger.log("".concat(method, " ").concat(url, " - ").concat(statusCode, " - ").concat(responseTime, "ms"), {
                        tenantId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.tenantId,
                        userId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.userId,
                        requestId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.requestId,
                        responseTime: responseTime,
                        responseSize: JSON.stringify(data).length,
                    });
                },
                error: function (error) {
                    var responseTime = Date.now() - now;
                    // Error logging is handled by AllExceptionsFilter
                    // This is just for tracking response time
                    _this.logger.error("".concat(method, " ").concat(url, " - ").concat(error.status || 500, " - ").concat(responseTime, "ms"), {
                        tenantId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.tenantId,
                        userId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.userId,
                        requestId: tenantContext === null || tenantContext === void 0 ? void 0 : tenantContext.requestId,
                        responseTime: responseTime,
                        error: error.message,
                    });
                },
            }));
        };
        LoggingInterceptor_1.prototype.sanitizeBody = function (body) {
            if (!body)
                return body;
            var sensitiveFields = [
                'password',
                'passwordHash',
                'refreshToken',
                'accessToken',
                'apiKey',
                'secret',
                'token',
                'creditCard',
                'cvv',
            ];
            var sanitized = __assign({}, body);
            for (var _i = 0, sensitiveFields_1 = sensitiveFields; _i < sensitiveFields_1.length; _i++) {
                var field = sensitiveFields_1[_i];
                if (sanitized[field]) {
                    sanitized[field] = '***REDACTED***';
                }
            }
            return sanitized;
        };
        return LoggingInterceptor_1;
    }());
    __setFunctionName(_classThis, "LoggingInterceptor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LoggingInterceptor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LoggingInterceptor = _classThis;
}();
exports.LoggingInterceptor = LoggingInterceptor;
