"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerErrorResponseDto = exports.ConflictResponseDto = exports.NotFoundResponseDto = exports.ForbiddenResponseDto = exports.UnauthorizedResponseDto = exports.ValidationErrorResponseDto = exports.ErrorResponseDto = exports.PaginatedResponseDto = exports.ApiResponseDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var ApiResponseDto = function () {
    var _a;
    var _success_decorators;
    var _success_initializers = [];
    var _success_extraInitializers = [];
    var _data_decorators;
    var _data_initializers = [];
    var _data_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _errors_decorators;
    var _errors_initializers = [];
    var _errors_extraInitializers = [];
    var _timestamp_decorators;
    var _timestamp_initializers = [];
    var _timestamp_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ApiResponseDto() {
                this.success = __runInitializers(this, _success_initializers, void 0);
                this.data = (__runInitializers(this, _success_extraInitializers), __runInitializers(this, _data_initializers, void 0));
                this.message = (__runInitializers(this, _data_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                this.errors = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _errors_initializers, void 0));
                this.timestamp = (__runInitializers(this, _errors_extraInitializers), __runInitializers(this, _timestamp_initializers, void 0));
                __runInitializers(this, _timestamp_extraInitializers);
            }
            return ApiResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _success_decorators = [(0, swagger_1.ApiProperty)({ description: 'Indicates if the request was successful' })];
            _data_decorators = [(0, swagger_1.ApiProperty)({ description: 'Response data', required: false })];
            _message_decorators = [(0, swagger_1.ApiProperty)({ description: 'Error message if request failed', required: false })];
            _errors_decorators = [(0, swagger_1.ApiProperty)({ description: 'Additional error details', required: false })];
            _timestamp_decorators = [(0, swagger_1.ApiProperty)({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })];
            __esDecorate(null, null, _success_decorators, { kind: "field", name: "success", static: false, private: false, access: { has: function (obj) { return "success" in obj; }, get: function (obj) { return obj.success; }, set: function (obj, value) { obj.success = value; } }, metadata: _metadata }, _success_initializers, _success_extraInitializers);
            __esDecorate(null, null, _data_decorators, { kind: "field", name: "data", static: false, private: false, access: { has: function (obj) { return "data" in obj; }, get: function (obj) { return obj.data; }, set: function (obj, value) { obj.data = value; } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _errors_decorators, { kind: "field", name: "errors", static: false, private: false, access: { has: function (obj) { return "errors" in obj; }, get: function (obj) { return obj.errors; }, set: function (obj, value) { obj.errors = value; } }, metadata: _metadata }, _errors_initializers, _errors_extraInitializers);
            __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: function (obj) { return "timestamp" in obj; }, get: function (obj) { return obj.timestamp; }, set: function (obj, value) { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ApiResponseDto = ApiResponseDto;
var PaginatedResponseDto = function () {
    var _a;
    var _items_decorators;
    var _items_initializers = [];
    var _items_extraInitializers = [];
    var _total_decorators;
    var _total_initializers = [];
    var _total_extraInitializers = [];
    var _page_decorators;
    var _page_initializers = [];
    var _page_extraInitializers = [];
    var _limit_decorators;
    var _limit_initializers = [];
    var _limit_extraInitializers = [];
    var _totalPages_decorators;
    var _totalPages_initializers = [];
    var _totalPages_extraInitializers = [];
    var _hasNext_decorators;
    var _hasNext_initializers = [];
    var _hasNext_extraInitializers = [];
    var _hasPrev_decorators;
    var _hasPrev_initializers = [];
    var _hasPrev_extraInitializers = [];
    return _a = /** @class */ (function () {
            function PaginatedResponseDto() {
                this.items = __runInitializers(this, _items_initializers, void 0);
                this.total = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _total_initializers, void 0));
                this.page = (__runInitializers(this, _total_extraInitializers), __runInitializers(this, _page_initializers, void 0));
                this.limit = (__runInitializers(this, _page_extraInitializers), __runInitializers(this, _limit_initializers, void 0));
                this.totalPages = (__runInitializers(this, _limit_extraInitializers), __runInitializers(this, _totalPages_initializers, void 0));
                this.hasNext = (__runInitializers(this, _totalPages_extraInitializers), __runInitializers(this, _hasNext_initializers, void 0));
                this.hasPrev = (__runInitializers(this, _hasNext_extraInitializers), __runInitializers(this, _hasPrev_initializers, void 0));
                __runInitializers(this, _hasPrev_extraInitializers);
            }
            return PaginatedResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _items_decorators = [(0, swagger_1.ApiProperty)({ description: 'Array of items' })];
            _total_decorators = [(0, swagger_1.ApiProperty)({ description: 'Total number of items', example: 100 })];
            _page_decorators = [(0, swagger_1.ApiProperty)({ description: 'Current page number', example: 1 })];
            _limit_decorators = [(0, swagger_1.ApiProperty)({ description: 'Number of items per page', example: 20 })];
            _totalPages_decorators = [(0, swagger_1.ApiProperty)({ description: 'Total number of pages', example: 5 })];
            _hasNext_decorators = [(0, swagger_1.ApiProperty)({ description: 'Indicates if there is a next page' })];
            _hasPrev_decorators = [(0, swagger_1.ApiProperty)({ description: 'Indicates if there is a previous page' })];
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: function (obj) { return "items" in obj; }, get: function (obj) { return obj.items; }, set: function (obj, value) { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            __esDecorate(null, null, _total_decorators, { kind: "field", name: "total", static: false, private: false, access: { has: function (obj) { return "total" in obj; }, get: function (obj) { return obj.total; }, set: function (obj, value) { obj.total = value; } }, metadata: _metadata }, _total_initializers, _total_extraInitializers);
            __esDecorate(null, null, _page_decorators, { kind: "field", name: "page", static: false, private: false, access: { has: function (obj) { return "page" in obj; }, get: function (obj) { return obj.page; }, set: function (obj, value) { obj.page = value; } }, metadata: _metadata }, _page_initializers, _page_extraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: function (obj) { return "limit" in obj; }, get: function (obj) { return obj.limit; }, set: function (obj, value) { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _limit_extraInitializers);
            __esDecorate(null, null, _totalPages_decorators, { kind: "field", name: "totalPages", static: false, private: false, access: { has: function (obj) { return "totalPages" in obj; }, get: function (obj) { return obj.totalPages; }, set: function (obj, value) { obj.totalPages = value; } }, metadata: _metadata }, _totalPages_initializers, _totalPages_extraInitializers);
            __esDecorate(null, null, _hasNext_decorators, { kind: "field", name: "hasNext", static: false, private: false, access: { has: function (obj) { return "hasNext" in obj; }, get: function (obj) { return obj.hasNext; }, set: function (obj, value) { obj.hasNext = value; } }, metadata: _metadata }, _hasNext_initializers, _hasNext_extraInitializers);
            __esDecorate(null, null, _hasPrev_decorators, { kind: "field", name: "hasPrev", static: false, private: false, access: { has: function (obj) { return "hasPrev" in obj; }, get: function (obj) { return obj.hasPrev; }, set: function (obj, value) { obj.hasPrev = value; } }, metadata: _metadata }, _hasPrev_initializers, _hasPrev_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.PaginatedResponseDto = PaginatedResponseDto;
var ErrorResponseDto = function () {
    var _a;
    var _statusCode_decorators;
    var _statusCode_initializers = [];
    var _statusCode_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _error_decorators;
    var _error_initializers = [];
    var _error_extraInitializers = [];
    var _path_decorators;
    var _path_initializers = [];
    var _path_extraInitializers = [];
    var _timestamp_decorators;
    var _timestamp_initializers = [];
    var _timestamp_extraInitializers = [];
    var _requestId_decorators;
    var _requestId_initializers = [];
    var _requestId_extraInitializers = [];
    var _validationErrors_decorators;
    var _validationErrors_initializers = [];
    var _validationErrors_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ErrorResponseDto() {
                this.statusCode = __runInitializers(this, _statusCode_initializers, void 0);
                this.message = (__runInitializers(this, _statusCode_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                this.error = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _error_initializers, void 0));
                this.path = (__runInitializers(this, _error_extraInitializers), __runInitializers(this, _path_initializers, void 0));
                this.timestamp = (__runInitializers(this, _path_extraInitializers), __runInitializers(this, _timestamp_initializers, void 0));
                this.requestId = (__runInitializers(this, _timestamp_extraInitializers), __runInitializers(this, _requestId_initializers, void 0));
                this.validationErrors = (__runInitializers(this, _requestId_extraInitializers), __runInitializers(this, _validationErrors_initializers, void 0));
                __runInitializers(this, _validationErrors_extraInitializers);
            }
            return ErrorResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _statusCode_decorators = [(0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 400 })];
            _message_decorators = [(0, swagger_1.ApiProperty)({ description: 'Error message', example: 'Bad Request' })];
            _error_decorators = [(0, swagger_1.ApiProperty)({ description: 'Detailed error information', required: false })];
            _path_decorators = [(0, swagger_1.ApiProperty)({ description: 'Request path', example: '/api/v1/quotes' })];
            _timestamp_decorators = [(0, swagger_1.ApiProperty)({ description: 'Error timestamp', example: '2024-01-01T00:00:00.000Z' })];
            _requestId_decorators = [(0, swagger_1.ApiProperty)({ description: 'Request ID for tracking', example: 'req_123456' })];
            _validationErrors_decorators = [(0, swagger_1.ApiProperty)({ description: 'Validation errors', required: false })];
            __esDecorate(null, null, _statusCode_decorators, { kind: "field", name: "statusCode", static: false, private: false, access: { has: function (obj) { return "statusCode" in obj; }, get: function (obj) { return obj.statusCode; }, set: function (obj, value) { obj.statusCode = value; } }, metadata: _metadata }, _statusCode_initializers, _statusCode_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _error_decorators, { kind: "field", name: "error", static: false, private: false, access: { has: function (obj) { return "error" in obj; }, get: function (obj) { return obj.error; }, set: function (obj, value) { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            __esDecorate(null, null, _path_decorators, { kind: "field", name: "path", static: false, private: false, access: { has: function (obj) { return "path" in obj; }, get: function (obj) { return obj.path; }, set: function (obj, value) { obj.path = value; } }, metadata: _metadata }, _path_initializers, _path_extraInitializers);
            __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: function (obj) { return "timestamp" in obj; }, get: function (obj) { return obj.timestamp; }, set: function (obj, value) { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
            __esDecorate(null, null, _requestId_decorators, { kind: "field", name: "requestId", static: false, private: false, access: { has: function (obj) { return "requestId" in obj; }, get: function (obj) { return obj.requestId; }, set: function (obj, value) { obj.requestId = value; } }, metadata: _metadata }, _requestId_initializers, _requestId_extraInitializers);
            __esDecorate(null, null, _validationErrors_decorators, { kind: "field", name: "validationErrors", static: false, private: false, access: { has: function (obj) { return "validationErrors" in obj; }, get: function (obj) { return obj.validationErrors; }, set: function (obj, value) { obj.validationErrors = value; } }, metadata: _metadata }, _validationErrors_initializers, _validationErrors_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ErrorResponseDto = ErrorResponseDto;
var ValidationErrorResponseDto = function () {
    var _a;
    var _classSuper = ErrorResponseDto;
    var _validationErrors_decorators;
    var _validationErrors_initializers = [];
    var _validationErrors_extraInitializers = [];
    return _a = /** @class */ (function (_super) {
            __extends(ValidationErrorResponseDto, _super);
            function ValidationErrorResponseDto() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.validationErrors = __runInitializers(_this, _validationErrors_initializers, void 0);
                __runInitializers(_this, _validationErrors_extraInitializers);
                return _this;
            }
            return ValidationErrorResponseDto;
        }(_classSuper)),
        (function () {
            var _b;
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _validationErrors_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Validation error details',
                    example: [
                        { field: 'email', message: 'Invalid email format' },
                        { field: 'password', message: 'Password must be at least 8 characters' }
                    ]
                })];
            __esDecorate(null, null, _validationErrors_decorators, { kind: "field", name: "validationErrors", static: false, private: false, access: { has: function (obj) { return "validationErrors" in obj; }, get: function (obj) { return obj.validationErrors; }, set: function (obj, value) { obj.validationErrors = value; } }, metadata: _metadata }, _validationErrors_initializers, _validationErrors_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ValidationErrorResponseDto = ValidationErrorResponseDto;
var UnauthorizedResponseDto = function () {
    var _a;
    var _statusCode_decorators;
    var _statusCode_initializers = [];
    var _statusCode_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _error_decorators;
    var _error_initializers = [];
    var _error_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UnauthorizedResponseDto() {
                this.statusCode = __runInitializers(this, _statusCode_initializers, void 0);
                this.message = (__runInitializers(this, _statusCode_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                this.error = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _error_initializers, void 0));
                __runInitializers(this, _error_extraInitializers);
            }
            return UnauthorizedResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _statusCode_decorators = [(0, swagger_1.ApiProperty)({ example: 401 })];
            _message_decorators = [(0, swagger_1.ApiProperty)({ example: 'Unauthorized' })];
            _error_decorators = [(0, swagger_1.ApiProperty)({ example: 'Invalid or expired token' })];
            __esDecorate(null, null, _statusCode_decorators, { kind: "field", name: "statusCode", static: false, private: false, access: { has: function (obj) { return "statusCode" in obj; }, get: function (obj) { return obj.statusCode; }, set: function (obj, value) { obj.statusCode = value; } }, metadata: _metadata }, _statusCode_initializers, _statusCode_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _error_decorators, { kind: "field", name: "error", static: false, private: false, access: { has: function (obj) { return "error" in obj; }, get: function (obj) { return obj.error; }, set: function (obj, value) { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UnauthorizedResponseDto = UnauthorizedResponseDto;
var ForbiddenResponseDto = function () {
    var _a;
    var _statusCode_decorators;
    var _statusCode_initializers = [];
    var _statusCode_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _error_decorators;
    var _error_initializers = [];
    var _error_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ForbiddenResponseDto() {
                this.statusCode = __runInitializers(this, _statusCode_initializers, void 0);
                this.message = (__runInitializers(this, _statusCode_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                this.error = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _error_initializers, void 0));
                __runInitializers(this, _error_extraInitializers);
            }
            return ForbiddenResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _statusCode_decorators = [(0, swagger_1.ApiProperty)({ example: 403 })];
            _message_decorators = [(0, swagger_1.ApiProperty)({ example: 'Forbidden' })];
            _error_decorators = [(0, swagger_1.ApiProperty)({ example: 'Insufficient permissions' })];
            __esDecorate(null, null, _statusCode_decorators, { kind: "field", name: "statusCode", static: false, private: false, access: { has: function (obj) { return "statusCode" in obj; }, get: function (obj) { return obj.statusCode; }, set: function (obj, value) { obj.statusCode = value; } }, metadata: _metadata }, _statusCode_initializers, _statusCode_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _error_decorators, { kind: "field", name: "error", static: false, private: false, access: { has: function (obj) { return "error" in obj; }, get: function (obj) { return obj.error; }, set: function (obj, value) { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ForbiddenResponseDto = ForbiddenResponseDto;
var NotFoundResponseDto = function () {
    var _a;
    var _statusCode_decorators;
    var _statusCode_initializers = [];
    var _statusCode_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _error_decorators;
    var _error_initializers = [];
    var _error_extraInitializers = [];
    return _a = /** @class */ (function () {
            function NotFoundResponseDto() {
                this.statusCode = __runInitializers(this, _statusCode_initializers, void 0);
                this.message = (__runInitializers(this, _statusCode_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                this.error = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _error_initializers, void 0));
                __runInitializers(this, _error_extraInitializers);
            }
            return NotFoundResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _statusCode_decorators = [(0, swagger_1.ApiProperty)({ example: 404 })];
            _message_decorators = [(0, swagger_1.ApiProperty)({ example: 'Not Found' })];
            _error_decorators = [(0, swagger_1.ApiProperty)({ example: 'Resource not found' })];
            __esDecorate(null, null, _statusCode_decorators, { kind: "field", name: "statusCode", static: false, private: false, access: { has: function (obj) { return "statusCode" in obj; }, get: function (obj) { return obj.statusCode; }, set: function (obj, value) { obj.statusCode = value; } }, metadata: _metadata }, _statusCode_initializers, _statusCode_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _error_decorators, { kind: "field", name: "error", static: false, private: false, access: { has: function (obj) { return "error" in obj; }, get: function (obj) { return obj.error; }, set: function (obj, value) { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.NotFoundResponseDto = NotFoundResponseDto;
var ConflictResponseDto = function () {
    var _a;
    var _statusCode_decorators;
    var _statusCode_initializers = [];
    var _statusCode_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _error_decorators;
    var _error_initializers = [];
    var _error_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ConflictResponseDto() {
                this.statusCode = __runInitializers(this, _statusCode_initializers, void 0);
                this.message = (__runInitializers(this, _statusCode_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                this.error = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _error_initializers, void 0));
                __runInitializers(this, _error_extraInitializers);
            }
            return ConflictResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _statusCode_decorators = [(0, swagger_1.ApiProperty)({ example: 409 })];
            _message_decorators = [(0, swagger_1.ApiProperty)({ example: 'Conflict' })];
            _error_decorators = [(0, swagger_1.ApiProperty)({ example: 'Resource already exists' })];
            __esDecorate(null, null, _statusCode_decorators, { kind: "field", name: "statusCode", static: false, private: false, access: { has: function (obj) { return "statusCode" in obj; }, get: function (obj) { return obj.statusCode; }, set: function (obj, value) { obj.statusCode = value; } }, metadata: _metadata }, _statusCode_initializers, _statusCode_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _error_decorators, { kind: "field", name: "error", static: false, private: false, access: { has: function (obj) { return "error" in obj; }, get: function (obj) { return obj.error; }, set: function (obj, value) { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ConflictResponseDto = ConflictResponseDto;
var InternalServerErrorResponseDto = function () {
    var _a;
    var _statusCode_decorators;
    var _statusCode_initializers = [];
    var _statusCode_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _error_decorators;
    var _error_initializers = [];
    var _error_extraInitializers = [];
    return _a = /** @class */ (function () {
            function InternalServerErrorResponseDto() {
                this.statusCode = __runInitializers(this, _statusCode_initializers, void 0);
                this.message = (__runInitializers(this, _statusCode_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                this.error = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _error_initializers, void 0));
                __runInitializers(this, _error_extraInitializers);
            }
            return InternalServerErrorResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _statusCode_decorators = [(0, swagger_1.ApiProperty)({ example: 500 })];
            _message_decorators = [(0, swagger_1.ApiProperty)({ example: 'Internal Server Error' })];
            _error_decorators = [(0, swagger_1.ApiProperty)({ example: 'An unexpected error occurred' })];
            __esDecorate(null, null, _statusCode_decorators, { kind: "field", name: "statusCode", static: false, private: false, access: { has: function (obj) { return "statusCode" in obj; }, get: function (obj) { return obj.statusCode; }, set: function (obj, value) { obj.statusCode = value; } }, metadata: _metadata }, _statusCode_initializers, _statusCode_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _error_decorators, { kind: "field", name: "error", static: false, private: false, access: { has: function (obj) { return "error" in obj; }, get: function (obj) { return obj.error; }, set: function (obj, value) { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.InternalServerErrorResponseDto = InternalServerErrorResponseDto;
