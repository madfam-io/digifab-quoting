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
exports.PresignedUploadResponseDto = exports.CreatePresignedUploadDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var CreatePresignedUploadDto = function () {
    var _a;
    var _filename_decorators;
    var _filename_initializers = [];
    var _filename_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _size_decorators;
    var _size_initializers = [];
    var _size_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreatePresignedUploadDto() {
                this.filename = __runInitializers(this, _filename_initializers, void 0);
                this.type = (__runInitializers(this, _filename_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.size = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _size_initializers, void 0));
                __runInitializers(this, _size_extraInitializers);
            }
            return CreatePresignedUploadDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _filename_decorators = [(0, swagger_1.ApiProperty)({
                    example: 'part123.stl',
                    description: 'Original filename with extension',
                    minLength: 1,
                    maxLength: 255,
                    pattern: '^[a-zA-Z0-9._-]+$'
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.Matches)(/^[a-zA-Z0-9._-]+$/, { message: 'Filename contains invalid characters' })];
            _type_decorators = [(0, swagger_1.ApiProperty)({
                    enum: ['stl', 'step', 'iges', 'dxf', 'dwg', 'pdf'],
                    description: 'File type/extension for the upload',
                    example: 'stl'
                }), (0, class_validator_1.IsEnum)(['stl', 'step', 'iges', 'dxf', 'dwg', 'pdf'])];
            _size_decorators = [(0, swagger_1.ApiProperty)({
                    example: 1048576,
                    description: 'File size in bytes (max 200MB)',
                    minimum: 1,
                    maximum: 209715200
                }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(200 * 1024 * 1024)];
            __esDecorate(null, null, _filename_decorators, { kind: "field", name: "filename", static: false, private: false, access: { has: function (obj) { return "filename" in obj; }, get: function (obj) { return obj.filename; }, set: function (obj, value) { obj.filename = value; } }, metadata: _metadata }, _filename_initializers, _filename_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _size_decorators, { kind: "field", name: "size", static: false, private: false, access: { has: function (obj) { return "size" in obj; }, get: function (obj) { return obj.size; }, set: function (obj, value) { obj.size = value; } }, metadata: _metadata }, _size_initializers, _size_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreatePresignedUploadDto = CreatePresignedUploadDto;
var PresignedUploadResponseDto = function () {
    var _a;
    var _fileId_decorators;
    var _fileId_initializers = [];
    var _fileId_extraInitializers = [];
    var _uploadUrl_decorators;
    var _uploadUrl_initializers = [];
    var _uploadUrl_extraInitializers = [];
    var _method_decorators;
    var _method_initializers = [];
    var _method_extraInitializers = [];
    var _headers_decorators;
    var _headers_initializers = [];
    var _headers_extraInitializers = [];
    var _expiresAt_decorators;
    var _expiresAt_initializers = [];
    var _expiresAt_extraInitializers = [];
    return _a = /** @class */ (function () {
            function PresignedUploadResponseDto() {
                this.fileId = __runInitializers(this, _fileId_initializers, void 0);
                this.uploadUrl = (__runInitializers(this, _fileId_extraInitializers), __runInitializers(this, _uploadUrl_initializers, void 0));
                this.method = (__runInitializers(this, _uploadUrl_extraInitializers), __runInitializers(this, _method_initializers, void 0));
                this.headers = (__runInitializers(this, _method_extraInitializers), __runInitializers(this, _headers_initializers, void 0));
                this.expiresAt = (__runInitializers(this, _headers_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
                __runInitializers(this, _expiresAt_extraInitializers);
            }
            return PresignedUploadResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _fileId_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Unique file identifier',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                })];
            _uploadUrl_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Presigned URL for uploading the file',
                    example: 'https://s3.amazonaws.com/bucket/files/123e4567.stl?X-Amz-Algorithm=AWS4-HMAC-SHA256&...'
                })];
            _method_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'HTTP method to use for upload',
                    example: 'PUT'
                })];
            _headers_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Headers to include in the upload request',
                    example: {
                        'Content-Type': 'model/stl',
                        'x-amz-server-side-encryption': 'AES256'
                    }
                })];
            _expiresAt_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'URL expiration timestamp',
                    example: '2024-01-01T01:00:00.000Z'
                })];
            __esDecorate(null, null, _fileId_decorators, { kind: "field", name: "fileId", static: false, private: false, access: { has: function (obj) { return "fileId" in obj; }, get: function (obj) { return obj.fileId; }, set: function (obj, value) { obj.fileId = value; } }, metadata: _metadata }, _fileId_initializers, _fileId_extraInitializers);
            __esDecorate(null, null, _uploadUrl_decorators, { kind: "field", name: "uploadUrl", static: false, private: false, access: { has: function (obj) { return "uploadUrl" in obj; }, get: function (obj) { return obj.uploadUrl; }, set: function (obj, value) { obj.uploadUrl = value; } }, metadata: _metadata }, _uploadUrl_initializers, _uploadUrl_extraInitializers);
            __esDecorate(null, null, _method_decorators, { kind: "field", name: "method", static: false, private: false, access: { has: function (obj) { return "method" in obj; }, get: function (obj) { return obj.method; }, set: function (obj, value) { obj.method = value; } }, metadata: _metadata }, _method_initializers, _method_extraInitializers);
            __esDecorate(null, null, _headers_decorators, { kind: "field", name: "headers", static: false, private: false, access: { has: function (obj) { return "headers" in obj; }, get: function (obj) { return obj.headers; }, set: function (obj, value) { obj.headers = value; } }, metadata: _metadata }, _headers_initializers, _headers_extraInitializers);
            __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: function (obj) { return "expiresAt" in obj; }, get: function (obj) { return obj.expiresAt; }, set: function (obj, value) { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.PresignedUploadResponseDto = PresignedUploadResponseDto;
