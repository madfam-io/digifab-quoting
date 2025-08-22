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
exports.FileAnalysisProcessor = void 0;
var bull_1 = require("@nestjs/bull");
var common_1 = require("@nestjs/common");
var job_interface_1 = require("../interfaces/job.interface");
var rxjs_1 = require("rxjs");
var error_handling_1 = require("@/common/utils/error-handling");
var FileAnalysisProcessor = function () {
    var _classDecorators = [(0, bull_1.Processor)(job_interface_1.JobType.FILE_ANALYSIS), (0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleFileAnalysis_decorators;
    var _onActive_decorators;
    var _onComplete_decorators;
    var _onFailed_decorators;
    var FileAnalysisProcessor = _classThis = /** @class */ (function () {
        function FileAnalysisProcessor_1(logger, prisma, filesService, httpService, configService) {
            this.logger = (__runInitializers(this, _instanceExtraInitializers), logger);
            this.prisma = prisma;
            this.filesService = filesService;
            this.httpService = httpService;
            this.configService = configService;
            this.workerServiceUrl = this.configService.get('worker.url', 'http://localhost:8000');
        }
        FileAnalysisProcessor_1.prototype.handleFileAnalysis = function (job) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, _a, fileId, fileUrl, fileName, fileType, analysisOptions, tenantId, fileBuffer, analysisResult, duration, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            startTime = Date.now();
                            _a = job.data, fileId = _a.fileId, fileUrl = _a.fileUrl, fileName = _a.fileName, fileType = _a.fileType, analysisOptions = _a.analysisOptions, tenantId = _a.tenantId;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 10, , 11]);
                            this.logger.log("Starting file analysis for ".concat(fileId), {
                                jobId: job.id,
                                tenantId: tenantId,
                                fileName: fileName,
                            });
                            // Update job progress
                            return [4 /*yield*/, this.updateProgress(job, 10, 'Downloading file')];
                        case 2:
                            // Update job progress
                            _b.sent();
                            return [4 /*yield*/, this.filesService.downloadFile(fileUrl)];
                        case 3:
                            fileBuffer = _b.sent();
                            return [4 /*yield*/, this.updateProgress(job, 20, 'File downloaded successfully')];
                        case 4:
                            _b.sent();
                            // Validate file format
                            if (!this.isValidFileFormat(fileType)) {
                                throw new Error("Unsupported file format: ".concat(fileType));
                            }
                            // Send to worker service for analysis
                            return [4 /*yield*/, this.updateProgress(job, 30, 'Sending to analysis service')];
                        case 5:
                            // Send to worker service for analysis
                            _b.sent();
                            return [4 /*yield*/, this.callWorkerService(fileBuffer, fileName, fileType, analysisOptions, job)];
                        case 6:
                            analysisResult = _b.sent();
                            return [4 /*yield*/, this.updateProgress(job, 90, 'Analysis complete, saving results')];
                        case 7:
                            _b.sent();
                            // Save analysis results to database
                            return [4 /*yield*/, this.saveAnalysisResults(fileId, analysisResult, tenantId)];
                        case 8:
                            // Save analysis results to database
                            _b.sent();
                            return [4 /*yield*/, this.updateProgress(job, 100, 'File analysis completed')];
                        case 9:
                            _b.sent();
                            duration = Date.now() - startTime;
                            return [2 /*return*/, {
                                    success: true,
                                    data: __assign(__assign({}, analysisResult), { metadata: __assign(__assign({}, analysisResult.metadata), { processingTime: duration }) }),
                                    duration: duration,
                                }];
                        case 10:
                            error_1 = _b.sent();
                            this.logger.error("File analysis failed for ".concat(fileId), (0, error_handling_1.toError)(error_1));
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'FILE_ANALYSIS_FAILED',
                                        message: (0, error_handling_1.getErrorMessage)(error_1),
                                        details: error_1,
                                    },
                                    duration: Date.now() - startTime,
                                }];
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        FileAnalysisProcessor_1.prototype.onActive = function (job) {
            this.logger.log("File analysis job ".concat(job.id, " started"), {
                fileId: job.data.fileId,
                tenantId: job.data.tenantId,
            });
        };
        FileAnalysisProcessor_1.prototype.onComplete = function (job, result) {
            this.logger.log("File analysis job ".concat(job.id, " completed"), {
                fileId: job.data.fileId,
                tenantId: job.data.tenantId,
                success: result.success,
                duration: result.duration,
            });
        };
        FileAnalysisProcessor_1.prototype.onFailed = function (job, err) {
            this.logger.error("File analysis job ".concat(job.id, " failed"), (0, error_handling_1.toError)(err));
        };
        FileAnalysisProcessor_1.prototype.updateProgress = function (job, percentage, message) {
            return __awaiter(this, void 0, void 0, function () {
                var progress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            progress = {
                                percentage: percentage,
                                message: message,
                                step: this.getStepFromPercentage(percentage),
                            };
                            return [4 /*yield*/, job.progress(progress)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, job.log("".concat(message, " (").concat(percentage, "%)"))];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        FileAnalysisProcessor_1.prototype.getStepFromPercentage = function (percentage) {
            if (percentage <= 10)
                return 'downloading';
            if (percentage <= 30)
                return 'validating';
            if (percentage <= 80)
                return 'analyzing';
            if (percentage <= 90)
                return 'processing-results';
            return 'saving';
        };
        FileAnalysisProcessor_1.prototype.isValidFileFormat = function (fileType) {
            var supportedFormats = [
                'stl', 'obj', 'step', 'stp', 'iges', 'igs',
                '3mf', 'dxf', 'dwg', 'svg', 'pdf',
            ];
            return supportedFormats.includes(fileType.toLowerCase());
        };
        FileAnalysisProcessor_1.prototype.callWorkerService = function (fileBuffer, fileName, fileType, analysisOptions, job) {
            return __awaiter(this, void 0, void 0, function () {
                var formData, blob, progressInterval, response, error_2;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            formData = new FormData();
                            blob = new Blob([fileBuffer], { type: "application/".concat(fileType) });
                            formData.append('file', blob, fileName);
                            formData.append('options', JSON.stringify(analysisOptions || {}));
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            progressInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                var currentProgress;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            currentProgress = job.progress();
                                            if (!(currentProgress.percentage < 80)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.updateProgress(job, currentProgress.percentage + 5, 'Analyzing geometry...')];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); }, 5000);
                            return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(this.httpService.post("".concat(this.workerServiceUrl, "/api/v1/analyze"), formData, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                    timeout: 5 * 60 * 1000, // 5 minutes
                                }))];
                        case 2:
                            response = _a.sent();
                            clearInterval(progressInterval);
                            return [2 /*return*/, {
                                    fileId: job.data.fileId,
                                    geometry: response.data.geometry || {},
                                    dfmAnalysis: response.data.dfm_analysis,
                                    features: response.data.features,
                                    metadata: {
                                        fileFormat: fileType,
                                        fileSize: fileBuffer.length,
                                        processingTime: response.data.processing_time || 0,
                                    },
                                }];
                        case 3:
                            error_2 = _a.sent();
                            // If worker service is unavailable, provide basic analysis
                            this.logger.warn("Worker service unavailable, using fallback analysis: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                            return [2 /*return*/, this.performBasicAnalysis(job.data.fileId, fileBuffer, fileType)];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        FileAnalysisProcessor_1.prototype.performBasicAnalysis = function (fileId, fileBuffer, fileType) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Basic analysis when worker service is unavailable
                    return [2 /*return*/, {
                            fileId: fileId,
                            geometry: {
                                // These would be calculated by the worker service
                                volume: undefined,
                                surfaceArea: undefined,
                                boundingBox: undefined,
                                partCount: 1,
                            },
                            dfmAnalysis: {
                                issues: [],
                                score: 100,
                                manufacturable: true,
                            },
                            features: {
                                hasUndercuts: false,
                                hasThinWalls: false,
                                hasSmallFeatures: false,
                                complexity: 'simple',
                            },
                            metadata: {
                                fileFormat: fileType,
                                fileSize: fileBuffer.length,
                                processingTime: 0,
                            },
                        }];
                });
            });
        };
        FileAnalysisProcessor_1.prototype.saveAnalysisResults = function (fileId, analysis, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b, _c;
                                var _d, _e;
                                var _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
                                return __generator(this, function (_v) {
                                    switch (_v.label) {
                                        case 0:
                                            _b = (_a = tx.file).update;
                                            _d = {
                                                where: {
                                                    id: fileId,
                                                    tenantId: tenantId,
                                                }
                                            };
                                            _e = {
                                                status: 'ANALYZED',
                                                analysisResult: analysis,
                                                analyzedAt: new Date()
                                            };
                                            _c = [{}];
                                            return [4 /*yield*/, tx.file.findUnique({
                                                    where: { id: fileId },
                                                    select: { metadata: true },
                                                })];
                                        case 1: 
                                        // Update file with analysis results
                                        return [4 /*yield*/, _b.apply(_a, [(_d.data = (_e.metadata = __assign.apply(void 0, [__assign.apply(void 0, _c.concat([((_f = (_v.sent())) === null || _f === void 0 ? void 0 : _f.metadata) || {}])), { geometry: analysis.geometry, dfmScore: (_g = analysis.dfmAnalysis) === null || _g === void 0 ? void 0 : _g.score, complexity: (_h = analysis.features) === null || _h === void 0 ? void 0 : _h.complexity }]),
                                                    _e),
                                                    _d)])];
                                        case 2:
                                            // Update file with analysis results
                                            _v.sent();
                                            // Create file analysis record
                                            return [4 /*yield*/, tx.fileAnalysis.create({
                                                    data: {
                                                        fileId: fileId,
                                                        tenantId: tenantId,
                                                        volume: analysis.geometry.volume,
                                                        surfaceArea: analysis.geometry.surfaceArea,
                                                        boundingBoxX: (_j = analysis.geometry.boundingBox) === null || _j === void 0 ? void 0 : _j.x,
                                                        boundingBoxY: (_k = analysis.geometry.boundingBox) === null || _k === void 0 ? void 0 : _k.y,
                                                        boundingBoxZ: (_l = analysis.geometry.boundingBox) === null || _l === void 0 ? void 0 : _l.z,
                                                        partCount: analysis.geometry.partCount || 1,
                                                        triangleCount: analysis.geometry.triangleCount,
                                                        dfmScore: ((_m = analysis.dfmAnalysis) === null || _m === void 0 ? void 0 : _m.score) || 100,
                                                        dfmIssues: ((_o = analysis.dfmAnalysis) === null || _o === void 0 ? void 0 : _o.issues) || [],
                                                        manufacturable: (_q = (_p = analysis.dfmAnalysis) === null || _p === void 0 ? void 0 : _p.manufacturable) !== null && _q !== void 0 ? _q : true,
                                                        hasUndercuts: ((_r = analysis.features) === null || _r === void 0 ? void 0 : _r.hasUndercuts) || false,
                                                        hasThinWalls: ((_s = analysis.features) === null || _s === void 0 ? void 0 : _s.hasThinWalls) || false,
                                                        hasSmallFeatures: ((_t = analysis.features) === null || _t === void 0 ? void 0 : _t.hasSmallFeatures) || false,
                                                        complexity: ((_u = analysis.features) === null || _u === void 0 ? void 0 : _u.complexity) || 'simple',
                                                        processingTime: analysis.metadata.processingTime,
                                                    },
                                                })];
                                        case 3:
                                            // Create file analysis record
                                            _v.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return FileAnalysisProcessor_1;
    }());
    __setFunctionName(_classThis, "FileAnalysisProcessor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleFileAnalysis_decorators = [(0, bull_1.Process)()];
        _onActive_decorators = [(0, bull_1.OnQueueActive)()];
        _onComplete_decorators = [(0, bull_1.OnQueueCompleted)()];
        _onFailed_decorators = [(0, bull_1.OnQueueFailed)()];
        __esDecorate(_classThis, null, _handleFileAnalysis_decorators, { kind: "method", name: "handleFileAnalysis", static: false, private: false, access: { has: function (obj) { return "handleFileAnalysis" in obj; }, get: function (obj) { return obj.handleFileAnalysis; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onActive_decorators, { kind: "method", name: "onActive", static: false, private: false, access: { has: function (obj) { return "onActive" in obj; }, get: function (obj) { return obj.onActive; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onComplete_decorators, { kind: "method", name: "onComplete", static: false, private: false, access: { has: function (obj) { return "onComplete" in obj; }, get: function (obj) { return obj.onComplete; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onFailed_decorators, { kind: "method", name: "onFailed", static: false, private: false, access: { has: function (obj) { return "onFailed" in obj; }, get: function (obj) { return obj.onFailed; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FileAnalysisProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FileAnalysisProcessor = _classThis;
}();
exports.FileAnalysisProcessor = FileAnalysisProcessor;
