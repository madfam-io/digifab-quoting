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
exports.RefreshTokenResponseDto = exports.RefreshTokenDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var RefreshTokenDto = function () {
    var _a;
    var _refreshToken_decorators;
    var _refreshToken_initializers = [];
    var _refreshToken_extraInitializers = [];
    return _a = /** @class */ (function () {
            function RefreshTokenDto() {
                this.refreshToken = __runInitializers(this, _refreshToken_initializers, void 0);
                __runInitializers(this, _refreshToken_extraInitializers);
            }
            return RefreshTokenDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _refreshToken_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Valid refresh token obtained from login',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    format: 'jwt'
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsJWT)()];
            __esDecorate(null, null, _refreshToken_decorators, { kind: "field", name: "refreshToken", static: false, private: false, access: { has: function (obj) { return "refreshToken" in obj; }, get: function (obj) { return obj.refreshToken; }, set: function (obj, value) { obj.refreshToken = value; } }, metadata: _metadata }, _refreshToken_initializers, _refreshToken_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.RefreshTokenDto = RefreshTokenDto;
var RefreshTokenResponseDto = function () {
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
    return _a = /** @class */ (function () {
            function RefreshTokenResponseDto() {
                this.accessToken = __runInitializers(this, _accessToken_initializers, void 0);
                this.refreshToken = (__runInitializers(this, _accessToken_extraInitializers), __runInitializers(this, _refreshToken_initializers, void 0));
                this.tokenType = (__runInitializers(this, _refreshToken_extraInitializers), __runInitializers(this, _tokenType_initializers, void 0));
                this.expiresIn = (__runInitializers(this, _tokenType_extraInitializers), __runInitializers(this, _expiresIn_initializers, void 0));
                __runInitializers(this, _expiresIn_extraInitializers);
            }
            return RefreshTokenResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _accessToken_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'New JWT access token',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                })];
            _refreshToken_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'New refresh token',
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
            __esDecorate(null, null, _accessToken_decorators, { kind: "field", name: "accessToken", static: false, private: false, access: { has: function (obj) { return "accessToken" in obj; }, get: function (obj) { return obj.accessToken; }, set: function (obj, value) { obj.accessToken = value; } }, metadata: _metadata }, _accessToken_initializers, _accessToken_extraInitializers);
            __esDecorate(null, null, _refreshToken_decorators, { kind: "field", name: "refreshToken", static: false, private: false, access: { has: function (obj) { return "refreshToken" in obj; }, get: function (obj) { return obj.refreshToken; }, set: function (obj, value) { obj.refreshToken = value; } }, metadata: _metadata }, _refreshToken_initializers, _refreshToken_extraInitializers);
            __esDecorate(null, null, _tokenType_decorators, { kind: "field", name: "tokenType", static: false, private: false, access: { has: function (obj) { return "tokenType" in obj; }, get: function (obj) { return obj.tokenType; }, set: function (obj, value) { obj.tokenType = value; } }, metadata: _metadata }, _tokenType_initializers, _tokenType_extraInitializers);
            __esDecorate(null, null, _expiresIn_decorators, { kind: "field", name: "expiresIn", static: false, private: false, access: { has: function (obj) { return "expiresIn" in obj; }, get: function (obj) { return obj.expiresIn; }, set: function (obj, value) { obj.expiresIn = value; } }, metadata: _metadata }, _expiresIn_initializers, _expiresIn_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.RefreshTokenResponseDto = RefreshTokenResponseDto;
