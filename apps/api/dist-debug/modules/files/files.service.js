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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.FilesService = void 0;
var common_1 = require("@nestjs/common");
var AWS = __importStar(require("aws-sdk"));
var crypto_1 = require("crypto");
var uuid_1 = require("uuid");
var shared_1 = require("@madfam/shared");
var error_handling_1 = require("@/common/utils/error-handling");
var FilesService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var FilesService = _classThis = /** @class */ (function () {
        function FilesService_1(prisma, configService) {
            this.prisma = prisma;
            this.configService = configService;
            this.s3 = new AWS.S3({
                region: this.configService.get('aws.s3.region') || 'us-east-1',
                signatureVersion: 'v4',
            });
            this.bucketName = this.configService.get('aws.s3.bucket') || 'madfam-uploads';
        }
        FilesService_1.prototype.createPresignedUpload = function (tenantId, filename, fileType, fileSize, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var allowedExtensions, extension, fileId, timestamp, safeFilename, key, params, presignedPost;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            // Validate file size
                            if (fileSize > shared_1.FILE_SIZE_LIMITS.maxFileSizeMB * 1024 * 1024) {
                                throw new common_1.BadRequestException("File size exceeds maximum of ".concat(shared_1.FILE_SIZE_LIMITS.maxFileSizeMB, "MB"));
                            }
                            allowedExtensions = this.getAllowedExtensions(fileType);
                            extension = (_a = filename.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                            if (!extension || !allowedExtensions.includes(extension)) {
                                throw new common_1.BadRequestException("Invalid file extension for type ".concat(fileType));
                            }
                            fileId = (0, uuid_1.v4)();
                            timestamp = Date.now();
                            safeFilename = this.sanitizeFilename(filename);
                            key = "".concat(tenantId, "/uploads/").concat(timestamp, "-").concat(fileId, "/").concat(safeFilename);
                            params = {
                                Bucket: this.bucketName,
                                Fields: {
                                    key: key,
                                    'Content-Type': this.getContentType(fileType),
                                    'x-amz-meta-tenant-id': tenantId,
                                    'x-amz-meta-file-id': fileId,
                                    'x-amz-meta-original-name': filename,
                                    'x-amz-meta-file-type': fileType,
                                },
                                Expires: 300, // 5 minutes
                                Conditions: [
                                    ['content-length-range', 0, fileSize],
                                    ['starts-with', '$Content-Type', ''],
                                ],
                            };
                            return [4 /*yield*/, this.s3.createPresignedPost(params)];
                        case 1:
                            presignedPost = _b.sent();
                            // Create file record in database
                            return [4 /*yield*/, this.prisma.file.create({
                                    data: {
                                        id: fileId,
                                        tenantId: tenantId,
                                        filename: safeFilename,
                                        originalName: filename,
                                        type: fileType,
                                        size: fileSize,
                                        path: key,
                                        hash: '', // Will be updated after upload confirmation
                                        metadata: {
                                            uploadedBy: userId,
                                            status: 'pending',
                                        },
                                    },
                                })];
                        case 2:
                            // Create file record in database
                            _b.sent();
                            return [2 /*return*/, {
                                    uploadUrl: presignedPost.url,
                                    uploadFields: presignedPost.fields,
                                    fileId: fileId,
                                    key: key,
                                }];
                    }
                });
            });
        };
        FilesService_1.prototype.confirmUpload = function (tenantId, fileId, ndaAcceptanceId) {
            return __awaiter(this, void 0, void 0, function () {
                var file, headResult, fileData, hash, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.file.findFirst({
                                where: {
                                    id: fileId,
                                    tenantId: tenantId,
                                },
                            })];
                        case 1:
                            file = _a.sent();
                            if (!file) {
                                throw new common_1.BadRequestException('File not found');
                            }
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 6, , 8]);
                            return [4 /*yield*/, this.s3.headObject({
                                    Bucket: this.bucketName,
                                    Key: file.path,
                                }).promise()];
                        case 3:
                            headResult = _a.sent();
                            return [4 /*yield*/, this.s3.getObject({
                                    Bucket: this.bucketName,
                                    Key: file.path,
                                }).promise()];
                        case 4:
                            fileData = _a.sent();
                            hash = (0, crypto_1.createHash)('sha256')
                                .update(fileData.Body)
                                .digest('hex');
                            // Update file record
                            return [4 /*yield*/, this.prisma.file.update({
                                    where: { id: fileId },
                                    data: {
                                        hash: hash,
                                        size: headResult.ContentLength || file.size,
                                        ndaAcceptanceId: ndaAcceptanceId,
                                        metadata: __assign(__assign({}, (file.metadata || {})), { status: 'confirmed', confirmedAt: new Date().toISOString() }),
                                    },
                                })];
                        case 5:
                            // Update file record
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 6:
                            error_1 = _a.sent();
                            return [4 /*yield*/, this.prisma.file.update({
                                    where: { id: fileId },
                                    data: {
                                        metadata: __assign(__assign({}, (file.metadata || {})), { status: 'failed', error: (0, error_handling_1.getErrorMessage)(error_1) }),
                                    },
                                })];
                        case 7:
                            _a.sent();
                            throw new common_1.BadRequestException('File upload verification failed');
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        FilesService_1.prototype.getFileUrl = function (tenantId, fileId) {
            return __awaiter(this, void 0, void 0, function () {
                var file, url;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.file.findFirst({
                                where: {
                                    id: fileId,
                                    tenantId: tenantId,
                                },
                            })];
                        case 1:
                            file = _a.sent();
                            if (!file) {
                                throw new common_1.BadRequestException('File not found');
                            }
                            return [4 /*yield*/, this.s3.getSignedUrlPromise('getObject', {
                                    Bucket: this.bucketName,
                                    Key: file.path,
                                    Expires: 3600,
                                })];
                        case 2:
                            url = _a.sent();
                            return [2 /*return*/, url];
                    }
                });
            });
        };
        FilesService_1.prototype.downloadFile = function (fileUrl) {
            return __awaiter(this, void 0, void 0, function () {
                var urlParts, pathParts, bucket, key, result, result, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            if (!(fileUrl.includes('s3.amazonaws.com') || fileUrl.includes('s3://'))) return [3 /*break*/, 2];
                            urlParts = new URL(fileUrl);
                            pathParts = urlParts.pathname.split('/').filter(function (p) { return p; });
                            bucket = urlParts.hostname.split('.')[0];
                            key = pathParts.join('/');
                            return [4 /*yield*/, this.s3.getObject({
                                    Bucket: bucket || this.bucketName,
                                    Key: key,
                                }).promise()];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.Body];
                        case 2: return [4 /*yield*/, this.s3.getObject({
                                Bucket: this.bucketName,
                                Key: fileUrl, // Assuming fileUrl is actually the key
                            }).promise()];
                        case 3:
                            result = _a.sent();
                            return [2 /*return*/, result.Body];
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            error_2 = _a.sent();
                            throw new common_1.BadRequestException("Failed to download file: ".concat((0, error_handling_1.getErrorMessage)(error_2)));
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        FilesService_1.prototype.deleteFile = function (tenantId, fileId) {
            return __awaiter(this, void 0, void 0, function () {
                var file;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.file.findFirst({
                                where: {
                                    id: fileId,
                                    tenantId: tenantId,
                                },
                            })];
                        case 1:
                            file = _a.sent();
                            if (!file) {
                                throw new common_1.BadRequestException('File not found');
                            }
                            // Delete from S3
                            return [4 /*yield*/, this.s3.deleteObject({
                                    Bucket: this.bucketName,
                                    Key: file.path,
                                }).promise()];
                        case 2:
                            // Delete from S3
                            _a.sent();
                            // Delete from database
                            return [4 /*yield*/, this.prisma.file.delete({
                                    where: { id: fileId },
                                })];
                        case 3:
                            // Delete from database
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        FilesService_1.prototype.getFilesByQuoteItem = function (tenantId, quoteItemId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.file.findMany({
                            where: {
                                tenantId: tenantId,
                                quoteItemId: quoteItemId,
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                        })];
                });
            });
        };
        FilesService_1.prototype.sanitizeFilename = function (filename) {
            return filename
                .replace(/[^a-zA-Z0-9.-]/g, '_')
                .replace(/_{2,}/g, '_')
                .toLowerCase();
        };
        FilesService_1.prototype.getContentType = function (fileType) {
            var contentTypes = {
                stl: 'model/stl',
                step: 'model/step',
                iges: 'model/iges',
                dxf: 'application/dxf',
                dwg: 'application/dwg',
                pdf: 'application/pdf',
            };
            return contentTypes[fileType] || 'application/octet-stream';
        };
        FilesService_1.prototype.getAllowedExtensions = function (fileType) {
            var extensions = {
                stl: ['stl'],
                step: ['step', 'stp'],
                iges: ['iges', 'igs'],
                dxf: ['dxf'],
                dwg: ['dwg'],
                pdf: ['pdf'],
            };
            return extensions[fileType] || [];
        };
        return FilesService_1;
    }());
    __setFunctionName(_classThis, "FilesService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FilesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FilesService = _classThis;
}();
exports.FilesService = FilesService;
