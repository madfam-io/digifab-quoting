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
exports.AllExceptionsFilter = void 0;
var common_1 = require("@nestjs/common");
var AllExceptionsFilter = function () {
    var _classDecorators = [(0, common_1.Catch)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AllExceptionsFilter = _classThis = /** @class */ (function () {
        function AllExceptionsFilter_1(tenantContext) {
            this.tenantContext = tenantContext;
            this.logger = new common_1.Logger(AllExceptionsFilter.name);
        }
        AllExceptionsFilter_1.prototype.catch = function (exception, host) {
            var ctx = host.switchToHttp();
            var response = ctx.getResponse();
            var request = ctx.getRequest();
            var context = this.tenantContext.getContext();
            var status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            var message = 'Internal server error';
            var error;
            var details;
            if (exception instanceof common_1.HttpException) {
                status = exception.getStatus();
                var exceptionResponse = exception.getResponse();
                if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                    var responseObj = exceptionResponse;
                    message = responseObj.message || exception.message;
                    error = responseObj.error;
                    details = responseObj.details;
                }
                else {
                    message = exceptionResponse;
                }
            }
            else if (exception instanceof Error) {
                message = exception.message;
                error = exception.name;
                // Log stack trace for non-HTTP exceptions
                this.logger.error("Unhandled exception: ".concat(exception.message), exception.stack, {
                    tenantId: context === null || context === void 0 ? void 0 : context.tenantId,
                    userId: context === null || context === void 0 ? void 0 : context.userId,
                    requestId: context === null || context === void 0 ? void 0 : context.requestId,
                    path: request.url,
                    method: request.method,
                });
            }
            else {
                // Unknown error type
                this.logger.error('Unknown exception type', exception, {
                    tenantId: context === null || context === void 0 ? void 0 : context.tenantId,
                    userId: context === null || context === void 0 ? void 0 : context.userId,
                    requestId: context === null || context === void 0 ? void 0 : context.requestId,
                    path: request.url,
                    method: request.method,
                });
            }
            var errorResponse = {
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                message: message,
                requestId: context === null || context === void 0 ? void 0 : context.requestId,
            };
            if (error) {
                errorResponse.error = error;
            }
            if (details && process.env.NODE_ENV !== 'production') {
                errorResponse.details = details;
            }
            // Log all errors
            if (status >= 500) {
                this.logger.error("".concat(request.method, " ").concat(request.url, " - ").concat(status, " - ").concat(JSON.stringify(message)), {
                    exception: exception instanceof Error ? exception.stack : exception,
                    tenantId: context === null || context === void 0 ? void 0 : context.tenantId,
                    userId: context === null || context === void 0 ? void 0 : context.userId,
                    requestId: context === null || context === void 0 ? void 0 : context.requestId,
                    body: request.body,
                    query: request.query,
                    params: request.params,
                });
            }
            else {
                this.logger.warn("".concat(request.method, " ").concat(request.url, " - ").concat(status, " - ").concat(JSON.stringify(message)), {
                    tenantId: context === null || context === void 0 ? void 0 : context.tenantId,
                    userId: context === null || context === void 0 ? void 0 : context.userId,
                    requestId: context === null || context === void 0 ? void 0 : context.requestId,
                });
            }
            response.status(status).json(errorResponse);
        };
        return AllExceptionsFilter_1;
    }());
    __setFunctionName(_classThis, "AllExceptionsFilter");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AllExceptionsFilter = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AllExceptionsFilter = _classThis;
}();
exports.AllExceptionsFilter = AllExceptionsFilter;
