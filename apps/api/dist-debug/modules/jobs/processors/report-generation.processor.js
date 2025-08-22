"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerationProcessor = void 0;
var bull_1 = require("@nestjs/bull");
var common_1 = require("@nestjs/common");
var job_interface_1 = require("../interfaces/job.interface");
var aws_sdk_1 = require("aws-sdk");
var pdfkit_1 = __importDefault(require("pdfkit"));
var ExcelJS = __importStar(require("exceljs"));
var fs_1 = require("fs");
var path_1 = require("path");
var os_1 = require("os");
var promises_1 = require("fs/promises");
var uuid_1 = require("uuid");
var ReportGenerationProcessor = function () {
    var _classDecorators = [(0, bull_1.Processor)(job_interface_1.JobType.REPORT_GENERATION), (0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleReportGeneration_decorators;
    var _onActive_decorators;
    var _onComplete_decorators;
    var _onFailed_decorators;
    var ReportGenerationProcessor = _classThis = /** @class */ (function () {
        function ReportGenerationProcessor_1(logger, prisma, configService) {
            this.logger = (__runInitializers(this, _instanceExtraInitializers), logger);
            this.prisma = prisma;
            this.configService = configService;
            this.s3 = new aws_sdk_1.S3({
                region: this.configService.get('aws.region'),
                accessKeyId: this.configService.get('aws.accessKeyId'),
                secretAccessKey: this.configService.get('aws.secretAccessKey'),
            });
        }
        ReportGenerationProcessor_1.prototype.handleReportGeneration = function (job) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, _a, reportType, entityId, format, options, tenantId, reportData, filePath, fileName, _b, fileUrl, stats, fileSize, reportId, error_1;
                var _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            startTime = Date.now();
                            _a = job.data, reportType = _a.reportType, entityId = _a.entityId, format = _a.format, options = _a.options, tenantId = _a.tenantId;
                            _f.label = 1;
                        case 1:
                            _f.trys.push([1, 20, , 21]);
                            this.logger.log("Starting ".concat(reportType, " report generation"), {
                                jobId: job.id,
                                tenantId: tenantId,
                                entityId: entityId,
                                format: format,
                            });
                            return [4 /*yield*/, this.updateProgress(job, 10, 'Loading data')];
                        case 2:
                            _f.sent();
                            return [4 /*yield*/, this.loadReportData(reportType, entityId, tenantId)];
                        case 3:
                            reportData = _f.sent();
                            if (!reportData) {
                                throw new Error("Entity ".concat(entityId, " not found for report type ").concat(reportType));
                            }
                            return [4 /*yield*/, this.updateProgress(job, 30, 'Generating report')];
                        case 4:
                            _f.sent();
                            filePath = void 0;
                            fileName = void 0;
                            _b = format;
                            switch (_b) {
                                case 'pdf': return [3 /*break*/, 5];
                                case 'excel': return [3 /*break*/, 7];
                                case 'csv': return [3 /*break*/, 9];
                            }
                            return [3 /*break*/, 11];
                        case 5: return [4 /*yield*/, this.generatePdfReport(reportType, reportData, options, job)];
                        case 6:
                            (_c = _f.sent(), filePath = _c.filePath, fileName = _c.fileName);
                            return [3 /*break*/, 12];
                        case 7: return [4 /*yield*/, this.generateExcelReport(reportType, reportData, options, job)];
                        case 8:
                            (_d = _f.sent(), filePath = _d.filePath, fileName = _d.fileName);
                            return [3 /*break*/, 12];
                        case 9: return [4 /*yield*/, this.generateCsvReport(reportType, reportData, options, job)];
                        case 10:
                            (_e = _f.sent(), filePath = _e.filePath, fileName = _e.fileName);
                            return [3 /*break*/, 12];
                        case 11: throw new Error("Unsupported format: ".concat(format));
                        case 12: return [4 /*yield*/, this.updateProgress(job, 80, 'Uploading report')];
                        case 13:
                            _f.sent();
                            return [4 /*yield*/, this.uploadToS3(filePath, fileName, tenantId)];
                        case 14:
                            fileUrl = _f.sent();
                            return [4 /*yield*/, require('fs/promises').stat(filePath)];
                        case 15:
                            stats = _f.sent();
                            fileSize = stats.size;
                            // Clean up temp file
                            return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                        case 16:
                            // Clean up temp file
                            _f.sent();
                            return [4 /*yield*/, this.updateProgress(job, 90, 'Saving report metadata')];
                        case 17:
                            _f.sent();
                            return [4 /*yield*/, this.saveReportMetadata(reportType, entityId, fileName, fileUrl, fileSize, tenantId)];
                        case 18:
                            reportId = _f.sent();
                            return [4 /*yield*/, this.updateProgress(job, 100, 'Report generation completed')];
                        case 19:
                            _f.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    data: {
                                        reportId: reportId,
                                        reportType: reportType,
                                        format: format,
                                        fileUrl: fileUrl,
                                        fileName: fileName,
                                        fileSize: fileSize,
                                        generatedAt: new Date(),
                                    },
                                    duration: Date.now() - startTime,
                                }];
                        case 20:
                            error_1 = _f.sent();
                            this.logger.error("Report generation failed - Job: ".concat(job.id, ", Type: ").concat(reportType, ", Entity: ").concat(entityId), error_1 instanceof Error ? error_1 : new Error(String(error_1)));
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'REPORT_GENERATION_FAILED',
                                        message: error_1 instanceof Error ? error_1.message : 'Report generation failed',
                                        details: error_1,
                                    },
                                    duration: Date.now() - startTime,
                                }];
                        case 21: return [2 /*return*/];
                    }
                });
            });
        };
        ReportGenerationProcessor_1.prototype.onActive = function (job) {
            this.logger.log("Report generation job ".concat(job.id, " started"), {
                reportType: job.data.reportType,
                entityId: job.data.entityId,
            });
        };
        ReportGenerationProcessor_1.prototype.onComplete = function (job, result) {
            this.logger.log("Report generation job ".concat(job.id, " completed"), {
                reportType: job.data.reportType,
                entityId: job.data.entityId,
                success: result.success,
            });
        };
        ReportGenerationProcessor_1.prototype.onFailed = function (job, err) {
            this.logger.error("Report generation job ".concat(job.id, " failed - Type: ").concat(job.data.reportType, ", Entity: ").concat(job.data.entityId, ", Attempts: ").concat(job.attemptsMade), err);
        };
        ReportGenerationProcessor_1.prototype.updateProgress = function (job, percentage, message) {
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
        ReportGenerationProcessor_1.prototype.getStepFromPercentage = function (percentage) {
            if (percentage <= 20)
                return 'loading-data';
            if (percentage <= 70)
                return 'generating-report';
            if (percentage <= 85)
                return 'uploading';
            return 'finalizing';
        };
        ReportGenerationProcessor_1.prototype.loadReportData = function (reportType, entityId, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var criteria;
                return __generator(this, function (_a) {
                    switch (reportType) {
                        case 'quote':
                            return [2 /*return*/, this.prisma.quote.findUnique({
                                    where: { id: entityId, tenantId: tenantId },
                                    include: {
                                        items: {
                                            include: {
                                                files: true,
                                                material: true,
                                                manufacturingProcess: true,
                                            },
                                        },
                                        customer: true,
                                        tenant: true,
                                    },
                                })];
                        case 'order':
                            return [2 /*return*/, this.prisma.order.findUnique({
                                    where: { id: entityId, tenantId: tenantId },
                                    include: {
                                        quote: {
                                            include: {
                                                items: {
                                                    include: {
                                                        files: true,
                                                        material: true,
                                                        manufacturingProcess: true,
                                                    },
                                                },
                                            },
                                        },
                                        customer: true,
                                    },
                                })];
                        case 'invoice':
                            return [2 /*return*/, this.prisma.invoice.findUnique({
                                    where: { id: entityId, tenantId: tenantId },
                                    include: {
                                        order: {
                                            include: {
                                                quote: {
                                                    include: {
                                                        items: true,
                                                    },
                                                },
                                            },
                                        },
                                        customer: true,
                                    },
                                })];
                        case 'analytics':
                            criteria = JSON.parse(entityId);
                            return [2 /*return*/, this.loadAnalyticsData(criteria, tenantId)];
                        default:
                            throw new Error("Unknown report type: ".concat(reportType));
                    }
                    return [2 /*return*/];
                });
            });
        };
        ReportGenerationProcessor_1.prototype.loadAnalyticsData = function (criteria, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var startDate, endDate, _a, groupBy, _b, quotes, orders, revenue;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            startDate = criteria.startDate, endDate = criteria.endDate, _a = criteria.groupBy, groupBy = _a === void 0 ? 'day' : _a;
                            return [4 /*yield*/, Promise.all([
                                    // Quote statistics
                                    this.prisma.quote.groupBy({
                                        by: ['status'],
                                        where: {
                                            tenantId: tenantId,
                                            createdAt: {
                                                gte: new Date(startDate),
                                                lte: new Date(endDate),
                                            },
                                        },
                                        _count: true,
                                        _sum: {
                                            total: true,
                                        },
                                    }),
                                    // Order statistics  
                                    this.prisma.order.groupBy({
                                        by: ['status'],
                                        where: {
                                            tenantId: tenantId,
                                            createdAt: {
                                                gte: new Date(startDate),
                                                lte: new Date(endDate),
                                            },
                                        },
                                        _count: true,
                                        _sum: {
                                            totalPaid: true,
                                        },
                                    }),
                                    // Revenue by day/week/month
                                    this.prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        SELECT \n          DATE_TRUNC(", ", created_at) as period,\n          COUNT(*) as order_count,\n          SUM(total_paid) as revenue\n        FROM orders\n        WHERE tenant_id = ", "\n          AND created_at >= ", "\n          AND created_at <= ", "\n          AND status = 'COMPLETED'\n        GROUP BY period\n        ORDER BY period\n      "], ["\n        SELECT \n          DATE_TRUNC(", ", created_at) as period,\n          COUNT(*) as order_count,\n          SUM(total_paid) as revenue\n        FROM orders\n        WHERE tenant_id = ", "\n          AND created_at >= ", "\n          AND created_at <= ", "\n          AND status = 'COMPLETED'\n        GROUP BY period\n        ORDER BY period\n      "])), groupBy, tenantId, startDate, endDate),
                                ])];
                        case 1:
                            _b = _c.sent(), quotes = _b[0], orders = _b[1], revenue = _b[2];
                            return [2 /*return*/, {
                                    criteria: criteria,
                                    quotes: quotes,
                                    orders: orders,
                                    revenue: revenue,
                                    generatedAt: new Date(),
                                }];
                    }
                });
            });
        };
        ReportGenerationProcessor_1.prototype.generatePdfReport = function (reportType, data, options, _job) {
            return __awaiter(this, void 0, void 0, function () {
                var fileName, filePath;
                var _this = this;
                return __generator(this, function (_a) {
                    fileName = "".concat(reportType, "-").concat(data.id || 'report', "-").concat(Date.now(), ".pdf");
                    filePath = (0, path_1.join)((0, os_1.tmpdir)(), fileName);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var doc = new pdfkit_1.default({ margin: 50 });
                            var stream = (0, fs_1.createWriteStream)(filePath);
                            doc.pipe(stream);
                            // Add report header
                            doc.fontSize(20).text(_this.getReportTitle(reportType, options === null || options === void 0 ? void 0 : options.language), {
                                align: 'center',
                            });
                            doc.moveDown();
                            // Add report content based on type
                            switch (reportType) {
                                case 'quote':
                                    _this.addQuoteContent(doc, data, options);
                                    break;
                                case 'order':
                                    _this.addOrderContent(doc, data, options);
                                    break;
                                case 'invoice':
                                    _this.addInvoiceContent(doc, data, options);
                                    break;
                                case 'analytics':
                                    _this.addAnalyticsContent(doc, data, options);
                                    break;
                            }
                            // Add footer
                            doc.fontSize(10)
                                .text("Generated on ".concat(new Date().toLocaleString()), 50, doc.page.height - 50, {
                                align: 'center',
                            });
                            doc.end();
                            stream.on('finish', function () {
                                resolve({ filePath: filePath, fileName: fileName });
                            });
                            stream.on('error', reject);
                        })];
                });
            });
        };
        ReportGenerationProcessor_1.prototype.generateExcelReport = function (reportType, data, options, _job) {
            return __awaiter(this, void 0, void 0, function () {
                var fileName, filePath, workbook;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fileName = "".concat(reportType, "-").concat(data.id || 'report', "-").concat(Date.now(), ".xlsx");
                            filePath = (0, path_1.join)((0, os_1.tmpdir)(), fileName);
                            workbook = new ExcelJS.Workbook();
                            workbook.creator = 'MADFAM Quoting System';
                            workbook.created = new Date();
                            switch (reportType) {
                                case 'quote':
                                case 'order':
                                    this.addQuoteOrderSheet(workbook, data, reportType, options);
                                    break;
                                case 'invoice':
                                    this.addInvoiceSheet(workbook, data, options);
                                    break;
                                case 'analytics':
                                    this.addAnalyticsSheets(workbook, data, options);
                                    break;
                            }
                            return [4 /*yield*/, workbook.xlsx.writeFile(filePath)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { filePath: filePath, fileName: fileName }];
                    }
                });
            });
        };
        ReportGenerationProcessor_1.prototype.generateCsvReport = function (reportType, data, _options, _job) {
            return __awaiter(this, void 0, void 0, function () {
                var fileName, filePath, csvContent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fileName = "".concat(reportType, "-").concat(data.id || 'report', "-").concat(Date.now(), ".csv");
                            filePath = (0, path_1.join)((0, os_1.tmpdir)(), fileName);
                            csvContent = '';
                            switch (reportType) {
                                case 'quote':
                                case 'order':
                                    csvContent = this.generateQuoteOrderCsv(data, reportType);
                                    break;
                                case 'analytics':
                                    csvContent = this.generateAnalyticsCsv(data);
                                    break;
                                default:
                                    throw new Error("CSV not supported for ".concat(reportType));
                            }
                            return [4 /*yield*/, require('fs/promises').writeFile(filePath, csvContent)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { filePath: filePath, fileName: fileName }];
                    }
                });
            });
        };
        ReportGenerationProcessor_1.prototype.getReportTitle = function (reportType, language) {
            var titles = {
                en: {
                    quote: 'Quote Report',
                    order: 'Order Report',
                    invoice: 'Invoice',
                    analytics: 'Analytics Report',
                },
                es: {
                    quote: 'Reporte de Cotización',
                    order: 'Reporte de Pedido',
                    invoice: 'Factura',
                    analytics: 'Reporte de Análisis',
                },
            };
            return titles[language || 'en'][reportType];
        };
        ReportGenerationProcessor_1.prototype.addQuoteContent = function (doc, quote, options) {
            // Customer information
            doc.fontSize(14).text('Customer Information', { underline: true });
            doc.fontSize(12)
                .text("Name: ".concat(quote.customer.name))
                .text("Email: ".concat(quote.customer.email))
                .text("Phone: ".concat(quote.customer.phone || 'N/A'))
                .moveDown();
            // Quote details
            doc.fontSize(14).text('Quote Details', { underline: true });
            doc.fontSize(12)
                .text("Quote Number: ".concat(quote.number))
                .text("Date: ".concat(quote.createdAt.toLocaleDateString()))
                .text("Valid Until: ".concat(quote.validUntil.toLocaleDateString()))
                .text("Status: ".concat(quote.status))
                .moveDown();
            // Items
            if (options === null || options === void 0 ? void 0 : options.includeItemDetails) {
                doc.fontSize(14).text('Items', { underline: true });
                quote.items.forEach(function (item, index) {
                    var _a, _b, _c, _d;
                    var fileName = ((_b = (_a = item.files) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.originalName) || item.name || 'Unknown file';
                    var materialName = ((_c = item.material) === null || _c === void 0 ? void 0 : _c.name) || 'Unknown material';
                    var processName = ((_d = item.manufacturingProcess) === null || _d === void 0 ? void 0 : _d.name) || item.processCode || 'Unknown process';
                    doc.fontSize(12)
                        .text("".concat(index + 1, ". ").concat(fileName))
                        .text("   Material: ".concat(materialName))
                        .text("   Process: ".concat(processName))
                        .text("   Quantity: ".concat(item.quantity))
                        .text("   Unit Price: ".concat(quote.currency, " ").concat(item.unitPrice))
                        .text("   Total: ".concat(quote.currency, " ").concat(item.totalPrice))
                        .moveDown(0.5);
                });
            }
            // Summary
            doc.fontSize(14).text('Summary', { underline: true });
            doc.fontSize(12)
                .text("Subtotal: ".concat(quote.currency, " ").concat(quote.subtotal))
                .text("Tax: ".concat(quote.currency, " ").concat(quote.tax))
                .text("Total: ".concat(quote.currency, " ").concat(quote.total));
        };
        ReportGenerationProcessor_1.prototype.addOrderContent = function (doc, order, options) {
            // Similar to quote but with order-specific fields
            this.addQuoteContent(doc, order.quote, options);
            doc.moveDown()
                .fontSize(14).text('Order Information', { underline: true })
                .fontSize(12)
                .text("Order Number: ".concat(order.number))
                .text("Order Date: ".concat(order.createdAt.toLocaleDateString()))
                .text("Payment Status: ".concat(order.paymentStatus))
                .text("Delivery Status: ".concat(order.status));
        };
        ReportGenerationProcessor_1.prototype.addInvoiceContent = function (doc, invoice, _options) {
            // Invoice header
            doc.fontSize(16).text("INVOICE #".concat(invoice.number), { align: 'right' });
            doc.moveDown();
            // Billing information
            // Set font before text
            doc.font('Helvetica-Bold')
                .fontSize(12)
                .text('Bill To:')
                .font('Helvetica')
                .text(invoice.customer.name)
                .text(invoice.customer.email)
                .text(invoice.customer.address || '')
                .moveDown();
            // Invoice details
            doc.text("Invoice Date: ".concat(invoice.createdAt.toLocaleDateString()))
                .text("Due Date: ".concat(invoice.dueDate.toLocaleDateString()))
                .moveDown();
            // Line items table would go here
            // ... implementation details ...
            // Total
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text("Total Due: ".concat(invoice.currency, " ").concat(invoice.total), {
                align: 'right'
            })
                .font('Helvetica');
        };
        ReportGenerationProcessor_1.prototype.addAnalyticsContent = function (doc, data, _options) {
            doc.fontSize(14).text('Report Period', { underline: true })
                .fontSize(12)
                .text("From: ".concat(new Date(data.criteria.startDate).toLocaleDateString()))
                .text("To: ".concat(new Date(data.criteria.endDate).toLocaleDateString()))
                .moveDown();
            // Summary statistics
            doc.fontSize(14).text('Summary', { underline: true });
            var totalQuotes = data.quotes.reduce(function (sum, q) { return sum + q._count; }, 0);
            var totalOrders = data.orders.reduce(function (sum, o) { return sum + o._count; }, 0);
            var totalRevenue = data.orders
                .filter(function (o) { return o.status === 'COMPLETED'; })
                .reduce(function (sum, o) { return sum + (o._sum.totalPaid || 0); }, 0);
            doc.fontSize(12)
                .text("Total Quotes: ".concat(totalQuotes))
                .text("Total Orders: ".concat(totalOrders))
                .text("Total Revenue: ".concat(data.criteria.currency || 'MXN', " ").concat(totalRevenue.toFixed(2)))
                .text("Conversion Rate: ".concat(((totalOrders / totalQuotes) * 100).toFixed(1), "%"))
                .moveDown();
            // Charts would be added here in a real implementation
        };
        ReportGenerationProcessor_1.prototype.addQuoteOrderSheet = function (workbook, data, type, _options) {
            var sheet = workbook.addWorksheet(type === 'quote' ? 'Quote' : 'Order');
            // Headers
            sheet.columns = [
                { header: 'Item', key: 'item', width: 30 },
                { header: 'Material', key: 'material', width: 20 },
                { header: 'Process', key: 'process', width: 20 },
                { header: 'Quantity', key: 'quantity', width: 10 },
                { header: 'Unit Price', key: 'unitPrice', width: 15 },
                { header: 'Total', key: 'total', width: 15 },
            ];
            // Data
            var items = type === 'quote' ? data.items : data.quote.items;
            items.forEach(function (item) {
                var _a, _b, _c, _d;
                var fileName = ((_b = (_a = item.files) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.originalName) || item.name || 'Unknown file';
                var materialName = ((_c = item.material) === null || _c === void 0 ? void 0 : _c.name) || 'Unknown material';
                var processName = ((_d = item.manufacturingProcess) === null || _d === void 0 ? void 0 : _d.name) || item.processCode || 'Unknown process';
                sheet.addRow({
                    item: fileName,
                    material: materialName,
                    process: processName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.totalPrice,
                });
            });
            // Summary
            sheet.addRow({});
            sheet.addRow({ item: 'Subtotal', total: data.subtotal || data.quote.subtotal });
            sheet.addRow({ item: 'Tax', total: data.tax || data.quote.tax });
            sheet.addRow({ item: 'Total', total: data.total || data.quote.total });
            // Formatting
            sheet.getRow(1).font = { bold: true };
            sheet.getColumn('unitPrice').numFmt = '"$"#,##0.00';
            sheet.getColumn('total').numFmt = '"$"#,##0.00';
        };
        ReportGenerationProcessor_1.prototype.addInvoiceSheet = function (workbook, _invoice, _options) {
            workbook.addWorksheet('Invoice');
            // Add invoice data similar to quote/order
            // Implementation details...
        };
        ReportGenerationProcessor_1.prototype.addAnalyticsSheets = function (workbook, data, _options) {
            // Revenue sheet
            var revenueSheet = workbook.addWorksheet('Revenue');
            revenueSheet.columns = [
                { header: 'Period', key: 'period', width: 20 },
                { header: 'Orders', key: 'orders', width: 10 },
                { header: 'Revenue', key: 'revenue', width: 15 },
            ];
            data.revenue.forEach(function (row) {
                revenueSheet.addRow({
                    period: row.period,
                    orders: row.order_count,
                    revenue: row.revenue,
                });
            });
            // Quote status sheet
            var quoteSheet = workbook.addWorksheet('Quotes');
            quoteSheet.columns = [
                { header: 'Status', key: 'status', width: 20 },
                { header: 'Count', key: 'count', width: 10 },
                { header: 'Value', key: 'value', width: 15 },
            ];
            data.quotes.forEach(function (row) {
                quoteSheet.addRow({
                    status: row.status,
                    count: row._count,
                    value: row._sum.total || 0,
                });
            });
        };
        ReportGenerationProcessor_1.prototype.generateQuoteOrderCsv = function (data, type) {
            var items = type === 'quote' ? data.items : data.quote.items;
            var csv = 'Item,Material,Process,Quantity,Unit Price,Total\n';
            items.forEach(function (item) {
                var _a, _b, _c, _d;
                var fileName = ((_b = (_a = item.files) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.originalName) || item.name || 'Unknown file';
                var materialName = ((_c = item.material) === null || _c === void 0 ? void 0 : _c.name) || 'Unknown material';
                var processName = ((_d = item.manufacturingProcess) === null || _d === void 0 ? void 0 : _d.name) || item.processCode || 'Unknown process';
                csv += "\"".concat(fileName, "\",\"").concat(materialName, "\",\"").concat(processName, "\",").concat(item.quantity, ",").concat(item.unitPrice, ",").concat(item.totalPrice, "\n");
            });
            csv += "\n,,,,Subtotal,".concat(data.subtotal || data.quote.subtotal, "\n");
            csv += ",,,,Tax,".concat(data.tax || data.quote.tax, "\n");
            csv += ",,,,Total,".concat(data.total || data.quote.total, "\n");
            return csv;
        };
        ReportGenerationProcessor_1.prototype.generateAnalyticsCsv = function (data) {
            var csv = 'Period,Orders,Revenue\n';
            data.revenue.forEach(function (row) {
                csv += "".concat(row.period, ",").concat(row.order_count, ",").concat(row.revenue, "\n");
            });
            return csv;
        };
        ReportGenerationProcessor_1.prototype.uploadToS3 = function (filePath, fileName, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var fileContent, key, params, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, require('fs/promises').readFile(filePath)];
                        case 1:
                            fileContent = _a.sent();
                            key = "".concat(tenantId, "/reports/").concat(Date.now(), "-").concat(fileName);
                            params = {
                                Bucket: this.configService.get('aws.s3.bucket'),
                                Key: key,
                                Body: fileContent,
                                ContentType: this.getContentType(fileName),
                                ServerSideEncryption: 'AES256',
                                Metadata: {
                                    tenantId: tenantId,
                                    generatedAt: new Date().toISOString(),
                                },
                            };
                            return [4 /*yield*/, this.s3.upload(params).promise()];
                        case 2:
                            result = _a.sent();
                            return [2 /*return*/, result.Location];
                    }
                });
            });
        };
        ReportGenerationProcessor_1.prototype.getContentType = function (fileName) {
            if (fileName.endsWith('.pdf'))
                return 'application/pdf';
            if (fileName.endsWith('.xlsx'))
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            if (fileName.endsWith('.csv'))
                return 'text/csv';
            return 'application/octet-stream';
        };
        ReportGenerationProcessor_1.prototype.saveReportMetadata = function (reportType, entityId, fileName, fileUrl, fileSize, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var report;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.report.create({
                                data: {
                                    id: (0, uuid_1.v4)(),
                                    tenantId: tenantId,
                                    type: reportType,
                                    entityId: entityId,
                                    fileName: fileName,
                                    fileUrl: fileUrl,
                                    fileSize: fileSize,
                                    status: 'COMPLETED',
                                    generatedAt: new Date(),
                                    metadata: {
                                        format: fileName.split('.').pop(),
                                    },
                                },
                            })];
                        case 1:
                            report = _a.sent();
                            return [2 /*return*/, report.id];
                    }
                });
            });
        };
        return ReportGenerationProcessor_1;
    }());
    __setFunctionName(_classThis, "ReportGenerationProcessor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleReportGeneration_decorators = [(0, bull_1.Process)()];
        _onActive_decorators = [(0, bull_1.OnQueueActive)()];
        _onComplete_decorators = [(0, bull_1.OnQueueCompleted)()];
        _onFailed_decorators = [(0, bull_1.OnQueueFailed)()];
        __esDecorate(_classThis, null, _handleReportGeneration_decorators, { kind: "method", name: "handleReportGeneration", static: false, private: false, access: { has: function (obj) { return "handleReportGeneration" in obj; }, get: function (obj) { return obj.handleReportGeneration; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onActive_decorators, { kind: "method", name: "onActive", static: false, private: false, access: { has: function (obj) { return "onActive" in obj; }, get: function (obj) { return obj.onActive; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onComplete_decorators, { kind: "method", name: "onComplete", static: false, private: false, access: { has: function (obj) { return "onComplete" in obj; }, get: function (obj) { return obj.onComplete; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onFailed_decorators, { kind: "method", name: "onFailed", static: false, private: false, access: { has: function (obj) { return "onFailed" in obj; }, get: function (obj) { return obj.onFailed; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReportGenerationProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReportGenerationProcessor = _classThis;
}();
exports.ReportGenerationProcessor = ReportGenerationProcessor;
var templateObject_1;
