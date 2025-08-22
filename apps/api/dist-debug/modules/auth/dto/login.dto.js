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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginResponseDto = exports.LoginDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var LoginDto = function () {
    var _a;
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _password_decorators;
    var _password_initializers = [];
    var _password_extraInitializers = [];
    var _tenantId_decorators;
    var _tenantId_initializers = [];
    var _tenantId_extraInitializers = [];
    return _a = /** @class */ (function () {
            function LoginDto() {
                this.email = __runInitializers(this, _email_initializers, void 0);
                this.password = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _password_initializers, void 0));
                this.tenantId = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _tenantId_initializers, void 0));
                __runInitializers(this, _tenantId_extraInitializers);
            }
            return LoginDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'user@example.com',
                    description: 'User email address',
                    format: 'email'
                }), (0, class_validator_1.IsEmail)()];
            _password_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'password123',
                    description: 'User password',
                    minLength: 8,
                    format: 'password'
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(8)];
            _tenantId_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    example: '123e4567-e89b-12d3-a456-426614174000',
                    description: 'Optional tenant ID for multi-tenant login',
                    format: 'uuid'
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: function (obj) { return "password" in obj; }, get: function (obj) { return obj.password; }, set: function (obj, value) { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            __esDecorate(null, null, _tenantId_decorators, { kind: "field", name: "tenantId", static: false, private: false, access: { has: function (obj) { return "tenantId" in obj; }, get: function (obj) { return obj.tenantId; }, set: function (obj, value) { obj.tenantId = value; } }, metadata: _metadata }, _tenantId_initializers, _tenantId_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.LoginDto = LoginDto;
var LoginResponseDto = function () {
    var _a;
    var _accessToken_decorators;
    var _accessToken_initializers = [];
    var _accessToken_extraInitializers = [];
    var _refreshToken_decorators;
    var _refreshToken_initializers = [];
    var _refreshToken_extraInitializers = [];
    var _tokenType_decorators;
    var _tokenType_initializers = [];
    var _tokenType_extraInitializers = [];
    var _expiresIn_decorators;
    var _expiresIn_initializers = [];
    var _expiresIn_extraInitializers = [];
    var _user_decorators;
    var _user_initializers = [];
    var _user_extraInitializers = [];
    return _a = /** @class */ (function () {
            function LoginResponseDto() {
                this.accessToken = __runInitializers(this, _accessToken_initializers, void 0);
                this.refreshToken = (__runInitializers(this, _accessToken_extraInitializers), __runInitializers(this, _refreshToken_initializers, void 0));
                this.tokenType = (__runInitializers(this, _refreshToken_extraInitializers), __runInitializers(this, _tokenType_initializers, void 0));
                this.expiresIn = (__runInitializers(this, _tokenType_extraInitializers), __runInitializers(this, _expiresIn_initializers, void 0));
                this.user = (__runInitializers(this, _expiresIn_extraInitializers), __runInitializers(this, _user_initializers, void 0));
                __runInitializers(this, _user_extraInitializers);
            }
            return LoginResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _accessToken_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'JWT access token',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                })];
            _refreshToken_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Refresh token for obtaining new access tokens',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                })];
            _tokenType_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Token type',
                    example: 'Bearer'
                })];
            _expiresIn_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Access token expiration time in seconds',
                    example: 3600
                })];
            _user_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'User information'
                })];
            __esDecorate(null, null, _accessToken_decorators, { kind: "field", name: "accessToken", static: false, private: false, access: { has: function (obj) { return "accessToken" in obj; }, get: function (obj) { return obj.accessToken; }, set: function (obj, value) { obj.accessToken = value; } }, metadata: _metadata }, _accessToken_initializers, _accessToken_extraInitializers);
            __esDecorate(null, null, _refreshToken_decorators, { kind: "field", name: "refreshToken", static: false, private: false, access: { has: function (obj) { return "refreshToken" in obj; }, get: function (obj) { return obj.refreshToken; }, set: function (obj, value) { obj.refreshToken = value; } }, metadata: _metadata }, _refreshToken_initializers, _refreshToken_extraInitializers);
            __esDecorate(null, null, _tokenType_decorators, { kind: "field", name: "tokenType", static: false, private: false, access: { has: function (obj) { return "tokenType" in obj; }, get: function (obj) { return obj.tokenType; }, set: function (obj, value) { obj.tokenType = value; } }, metadata: _metadata }, _tokenType_initializers, _tokenType_extraInitializers);
            __esDecorate(null, null, _expiresIn_decorators, { kind: "field", name: "expiresIn", static: false, private: false, access: { has: function (obj) { return "expiresIn" in obj; }, get: function (obj) { return obj.expiresIn; }, set: function (obj, value) { obj.expiresIn = value; } }, metadata: _metadata }, _expiresIn_initializers, _expiresIn_extraInitializers);
            __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.LoginResponseDto = LoginResponseDto;
