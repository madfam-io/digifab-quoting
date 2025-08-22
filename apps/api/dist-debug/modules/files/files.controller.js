"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var create_presigned_upload_dto_1 = require("./dto/create-presigned-upload.dto");
var api_response_dto_1 = require("../../common/dto/api-response.dto");
var FilesController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('files'), (0, common_1.Controller)('files'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiUnauthorizedResponse)({
            description: 'Unauthorized - Invalid or missing JWT token',
            type: api_response_dto_1.UnauthorizedResponseDto
        }), (0, swagger_1.ApiHeader)({
            name: 'X-Tenant-ID',
            description: 'Tenant identifier for multi-tenant operations',
            required: false
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _createPresignedUpload_decorators;
    var _confirmUpload_decorators;
    var _getFileUrl_decorators;
    var _deleteFile_decorators;
    var FilesController = _classThis = /** @class */ (function () {
        function FilesController_1(filesService) {
            this.filesService = (__runInitializers(this, _instanceExtraInitializers), filesService);
        }
        FilesController_1.prototype.createPresignedUpload = function (req, dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.filesService.createPresignedUpload(req.user.tenantId, dto.filename, dto.type, dto.size, req.user.id)];
                });
            });
        };
        FilesController_1.prototype.confirmUpload = function (req, fileId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.filesService.confirmUpload(req.user.tenantId, fileId, dto.ndaAcceptanceId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        FilesController_1.prototype.getFileUrl = function (req, fileId) {
            return __awaiter(this, void 0, void 0, function () {
                var url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.filesService.getFileUrl(req.user.tenantId, fileId)];
                        case 1:
                            url = _a.sent();
                            return [2 /*return*/, { url: url }];
                    }
                });
            });
        };
        FilesController_1.prototype.deleteFile = function (req, fileId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.filesService.deleteFile(req.user.tenantId, fileId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return FilesController_1;
    }());
    __setFunctionName(_classThis, "FilesController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createPresignedUpload_decorators = [(0, common_1.Post)('presign'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED), (0, swagger_1.ApiOperation)({
                summary: 'Create presigned upload URL',
                description: 'Generate a presigned URL for secure direct file upload to S3'
            }), (0, swagger_1.ApiResponse)({
                status: 201,
                description: 'Presigned URL created successfully',
                type: create_presigned_upload_dto_1.PresignedUploadResponseDto
            }), (0, swagger_1.ApiBadRequestResponse)({
                description: 'Invalid file type or size',
                type: api_response_dto_1.ValidationErrorResponseDto
            }), (0, swagger_1.ApiPayloadTooLargeResponse)({
                description: 'File size exceeds 200MB limit'
            })];
        _confirmUpload_decorators = [(0, common_1.Post)(':id/confirm'), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT), (0, swagger_1.ApiOperation)({
                summary: 'Confirm file upload',
                description: 'Confirm that file upload to S3 was successful and trigger processing'
            }), (0, swagger_1.ApiParam)({
                name: 'id',
                description: 'File ID from presigned upload',
                example: '123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiResponse)({
                status: 204,
                description: 'Upload confirmed successfully'
            }), (0, swagger_1.ApiNotFoundResponse)({
                description: 'File not found or already confirmed',
                type: api_response_dto_1.NotFoundResponseDto
            }), (0, swagger_1.ApiBadRequestResponse)({
                description: 'File upload not completed or validation failed',
                type: api_response_dto_1.ValidationErrorResponseDto
            })];
        _getFileUrl_decorators = [(0, common_1.Get)(':id/url'), (0, swagger_1.ApiOperation)({
                summary: 'Get temporary download URL',
                description: 'Generate a temporary presigned URL for downloading the file'
            }), (0, swagger_1.ApiParam)({
                name: 'id',
                description: 'File ID',
                example: '123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Download URL generated',
                schema: {
                    properties: {
                        url: {
                            type: 'string',
                            example: 'https://s3.amazonaws.com/bucket/files/123e4567.stl?X-Amz-Algorithm=...',
                            description: 'Presigned download URL (valid for 1 hour)'
                        }
                    }
                }
            }), (0, swagger_1.ApiNotFoundResponse)({
                description: 'File not found',
                type: api_response_dto_1.NotFoundResponseDto
            })];
        _deleteFile_decorators = [(0, common_1.Delete)(':id'), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT), (0, swagger_1.ApiOperation)({
                summary: 'Delete file',
                description: 'Delete a file from storage. Files associated with active quotes cannot be deleted.'
            }), (0, swagger_1.ApiParam)({
                name: 'id',
                description: 'File ID',
                example: '123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiResponse)({
                status: 204,
                description: 'File deleted successfully'
            }), (0, swagger_1.ApiNotFoundResponse)({
                description: 'File not found',
                type: api_response_dto_1.NotFoundResponseDto
            }), (0, swagger_1.ApiBadRequestResponse)({
                description: 'File is associated with an active quote',
                type: api_response_dto_1.ValidationErrorResponseDto
            })];
        __esDecorate(_classThis, null, _createPresignedUpload_decorators, { kind: "method", name: "createPresignedUpload", static: false, private: false, access: { has: function (obj) { return "createPresignedUpload" in obj; }, get: function (obj) { return obj.createPresignedUpload; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _confirmUpload_decorators, { kind: "method", name: "confirmUpload", static: false, private: false, access: { has: function (obj) { return "confirmUpload" in obj; }, get: function (obj) { return obj.confirmUpload; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFileUrl_decorators, { kind: "method", name: "getFileUrl", static: false, private: false, access: { has: function (obj) { return "getFileUrl" in obj; }, get: function (obj) { return obj.getFileUrl; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteFile_decorators, { kind: "method", name: "deleteFile", static: false, private: false, access: { has: function (obj) { return "deleteFile" in obj; }, get: function (obj) { return obj.deleteFile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FilesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FilesController = _classThis;
}();
exports.FilesController = FilesController;
