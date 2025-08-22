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
exports.QuoteCalculationProcessor = void 0;
var bull_1 = require("@nestjs/bull");
var common_1 = require("@nestjs/common");
var job_interface_1 = require("../interfaces/job.interface");
var decimal_js_1 = require("decimal.js");
var error_handling_1 = require("@/common/utils/error-handling");
var QuoteCalculationProcessor = function () {
    var _classDecorators = [(0, bull_1.Processor)(job_interface_1.JobType.QUOTE_CALCULATION), (0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleQuoteCalculation_decorators;
    var _onActive_decorators;
    var _onComplete_decorators;
    var _onFailed_decorators;
    var QuoteCalculationProcessor = _classThis = /** @class */ (function () {
        function QuoteCalculationProcessor_1(logger, prisma, pricingService) {
            this.logger = (__runInitializers(this, _instanceExtraInitializers), logger);
            this.prisma = prisma;
            this.pricingService = pricingService;
        }
        QuoteCalculationProcessor_1.prototype.handleQuoteCalculation = function (job) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, _a, quoteId, items, rushOrder, _b, currency, tenantId, quote, pricingConfig, calculatedItems, currentProgress, progressPerItem, _i, items_1, item, calculatedItem, summary, duration, error_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            startTime = Date.now();
                            _a = job.data, quoteId = _a.quoteId, items = _a.items, rushOrder = _a.rushOrder, _b = _a.currency, currency = _b === void 0 ? 'MXN' : _b, tenantId = _a.tenantId;
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 18, , 19]);
                            this.logger.log("Starting quote calculation for ".concat(quoteId), {
                                jobId: job.id,
                                tenantId: tenantId,
                                itemCount: items.length,
                            });
                            // Check if job was cancelled
                            if (job.data['cancelled']) {
                                throw new Error('Job was cancelled');
                            }
                            return [4 /*yield*/, this.updateProgress(job, 10, 'Loading quote data')];
                        case 2:
                            _c.sent();
                            return [4 /*yield*/, this.loadQuoteWithItems(quoteId, tenantId)];
                        case 3:
                            quote = _c.sent();
                            if (!quote) {
                                throw new Error("Quote ".concat(quoteId, " not found"));
                            }
                            return [4 /*yield*/, this.updateProgress(job, 20, 'Validating files and materials')];
                        case 4:
                            _c.sent();
                            // Validate all files are analyzed
                            return [4 /*yield*/, this.validateFilesAnalyzed(items, tenantId)];
                        case 5:
                            // Validate all files are analyzed
                            _c.sent();
                            return [4 /*yield*/, this.pricingService.getTenantPricingConfig(tenantId)];
                        case 6:
                            pricingConfig = _c.sent();
                            return [4 /*yield*/, this.updateProgress(job, 30, 'Calculating item prices')];
                        case 7:
                            _c.sent();
                            calculatedItems = [];
                            currentProgress = 30;
                            progressPerItem = 50 / items.length;
                            _i = 0, items_1 = items;
                            _c.label = 8;
                        case 8:
                            if (!(_i < items_1.length)) return [3 /*break*/, 12];
                            item = items_1[_i];
                            if (job.data['cancelled']) {
                                throw new Error('Job was cancelled');
                            }
                            return [4 /*yield*/, this.calculateItemPrice(item, pricingConfig, tenantId)];
                        case 9:
                            calculatedItem = _c.sent();
                            calculatedItems.push(calculatedItem);
                            currentProgress += progressPerItem;
                            return [4 /*yield*/, this.updateProgress(job, Math.round(currentProgress), "Calculated price for item ".concat(calculatedItems.length, "/").concat(items.length))];
                        case 10:
                            _c.sent();
                            _c.label = 11;
                        case 11:
                            _i++;
                            return [3 /*break*/, 8];
                        case 12: return [4 /*yield*/, this.updateProgress(job, 80, 'Calculating quote summary')];
                        case 13:
                            _c.sent();
                            return [4 /*yield*/, this.calculateQuoteSummary(calculatedItems, rushOrder || false, currency, pricingConfig)];
                        case 14:
                            summary = _c.sent();
                            return [4 /*yield*/, this.updateProgress(job, 90, 'Saving calculation results')];
                        case 15:
                            _c.sent();
                            // Save results to database
                            return [4 /*yield*/, this.saveCalculationResults(quoteId, calculatedItems, summary, tenantId)];
                        case 16:
                            // Save results to database
                            _c.sent();
                            return [4 /*yield*/, this.updateProgress(job, 100, 'Quote calculation completed')];
                        case 17:
                            _c.sent();
                            duration = Date.now() - startTime;
                            return [2 /*return*/, {
                                    success: true,
                                    data: {
                                        quoteId: quoteId,
                                        items: calculatedItems,
                                        summary: summary,
                                        pricing: {
                                            basePrice: summary.subtotal,
                                            adjustments: this.getAdjustments(summary),
                                            profitMargin: pricingConfig.defaultMargin,
                                        },
                                    },
                                    duration: duration,
                                }];
                        case 18:
                            error_1 = _c.sent();
                            this.logger.error("Quote calculation failed for ".concat(quoteId), (0, error_handling_1.toError)(error_1));
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'QUOTE_CALCULATION_FAILED',
                                        message: (0, error_handling_1.getErrorMessage)(error_1),
                                        details: error_1,
                                    },
                                    duration: Date.now() - startTime,
                                }];
                        case 19: return [2 /*return*/];
                    }
                });
            });
        };
        QuoteCalculationProcessor_1.prototype.onActive = function (job) {
            this.logger.log("Quote calculation job ".concat(job.id, " started"), {
                quoteId: job.data.quoteId,
                tenantId: job.data.tenantId,
            });
        };
        QuoteCalculationProcessor_1.prototype.onComplete = function (job, result) {
            this.logger.log("Quote calculation job ".concat(job.id, " completed"), {
                quoteId: job.data.quoteId,
                tenantId: job.data.tenantId,
                success: result.success,
                duration: result.duration,
            });
        };
        QuoteCalculationProcessor_1.prototype.onFailed = function (job, err) {
            this.logger.error("Quote calculation job ".concat(job.id, " failed"), (0, error_handling_1.toError)(err));
        };
        QuoteCalculationProcessor_1.prototype.updateProgress = function (job, percentage, message) {
            return __awaiter(this, void 0, void 0, function () {
                var progress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            progress = {
                                percentage: percentage,
                                message: message,
                                step: this.getStepFromPercentage(percentage),
                                metadata: {
                                    quoteId: job.data.quoteId,
                                    itemsProcessed: this.getItemsProcessed(percentage, job.data.items.length),
                                },
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
        QuoteCalculationProcessor_1.prototype.getStepFromPercentage = function (percentage) {
            if (percentage <= 20)
                return 'loading-data';
            if (percentage <= 30)
                return 'validating';
            if (percentage <= 80)
                return 'calculating-prices';
            if (percentage <= 90)
                return 'calculating-summary';
            return 'saving-results';
        };
        QuoteCalculationProcessor_1.prototype.getItemsProcessed = function (percentage, totalItems) {
            if (percentage <= 30)
                return 0;
            if (percentage >= 80)
                return totalItems;
            var itemProgress = (percentage - 30) / 50;
            return Math.floor(itemProgress * totalItems);
        };
        QuoteCalculationProcessor_1.prototype.loadQuoteWithItems = function (quoteId, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.quote.findUnique({
                            where: {
                                id: quoteId,
                                tenantId: tenantId,
                            },
                            include: {
                                items: {
                                    include: {
                                        files: {
                                            include: {
                                                fileAnalysis: true,
                                            },
                                        },
                                        material: true,
                                        manufacturingProcess: true,
                                    },
                                },
                                customer: true,
                            },
                        })];
                });
            });
        };
        QuoteCalculationProcessor_1.prototype.validateFilesAnalyzed = function (items, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var fileIds, files, unanalyzedFiles;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fileIds = items.map(function (item) { return item.fileId; });
                            return [4 /*yield*/, this.prisma.file.findMany({
                                    where: {
                                        id: { in: fileIds },
                                        tenantId: tenantId,
                                    },
                                    include: {
                                        fileAnalysis: true,
                                    },
                                })];
                        case 1:
                            files = _a.sent();
                            unanalyzedFiles = files.filter(function (f) { return !f.fileAnalysis; });
                            if (unanalyzedFiles.length > 0) {
                                throw new Error("Files not analyzed: ".concat(unanalyzedFiles.map(function (f) { return f.filename; }).join(', ')));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        QuoteCalculationProcessor_1.prototype.calculateItemPrice = function (item, pricingConfig, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var fileAnalysis, _a, material, process, volume, materialCost, setupCost, machineTime, laborCost, overheadRate, overheadCost, marginRate, totalCost, margin, unitPrice, totalPrice, leadTime;
                var _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0: return [4 /*yield*/, this.prisma.fileAnalysis.findUnique({
                                where: {
                                    fileId: item.fileId,
                                },
                            })];
                        case 1:
                            fileAnalysis = _g.sent();
                            if (!fileAnalysis) {
                                throw new Error("File analysis not found for file ".concat(item.fileId));
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.material.findFirst({
                                        where: {
                                            code: item.material,
                                            tenantId: tenantId,
                                        },
                                    }),
                                    this.prisma.manufacturingProcess.findFirst({
                                        where: {
                                            code: item.process,
                                            tenantId: tenantId,
                                        },
                                    }),
                                ])];
                        case 2:
                            _a = _g.sent(), material = _a[0], process = _a[1];
                            if (!material || !process) {
                                throw new Error('Material or process not found');
                            }
                            volume = fileAnalysis.volume ? new decimal_js_1.Decimal(fileAnalysis.volume.toString()).toNumber() : 0;
                            materialCost = new decimal_js_1.Decimal(volume)
                                .mul(((_b = material.density) === null || _b === void 0 ? void 0 : _b.toString()) || '1')
                                .mul(((_c = material.costPerKg) === null || _c === void 0 ? void 0 : _c.toString()) || '0')
                                .toNumber();
                            setupCost = new decimal_js_1.Decimal(((_d = process.setupCost) === null || _d === void 0 ? void 0 : _d.toString()) || '0').toNumber();
                            machineTime = this.estimateMachineTime(volume, process.code, ((_e = fileAnalysis.complexity) === null || _e === void 0 ? void 0 : _e.toString()) || 'moderate');
                            laborCost = new decimal_js_1.Decimal(machineTime)
                                .mul(((_f = process.hourlyRate) === null || _f === void 0 ? void 0 : _f.toString()) || '0')
                                .toNumber();
                            overheadRate = pricingConfig.overheadRate || 0.15;
                            overheadCost = new decimal_js_1.Decimal(materialCost + laborCost)
                                .mul(overheadRate)
                                .toNumber();
                            marginRate = this.getMarginRate(item.quantity, fileAnalysis.complexity, pricingConfig);
                            totalCost = materialCost + laborCost + overheadCost + setupCost;
                            margin = new decimal_js_1.Decimal(totalCost).mul(marginRate).toNumber();
                            unitPrice = new decimal_js_1.Decimal(totalCost + margin)
                                .div(item.quantity)
                                .toNumber();
                            totalPrice = new decimal_js_1.Decimal(unitPrice)
                                .mul(item.quantity)
                                .toNumber();
                            leadTime = this.estimateLeadTime(machineTime * item.quantity, process.code);
                            return [2 /*return*/, {
                                    id: "item-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
                                    fileId: item.fileId,
                                    unitPrice: Math.round(unitPrice * 100) / 100,
                                    totalPrice: Math.round(totalPrice * 100) / 100,
                                    materialCost: Math.round(materialCost * 100) / 100,
                                    laborCost: Math.round(laborCost * 100) / 100,
                                    overheadCost: Math.round(overheadCost * 100) / 100,
                                    margin: Math.round(margin * 100) / 100,
                                    leadTime: leadTime,
                                }];
                    }
                });
            });
        };
        QuoteCalculationProcessor_1.prototype.estimateMachineTime = function (volume, processCode, complexity) {
            // Base time estimates (hours per cm³)
            var baseRates = {
                'FFF': 0.001,
                'SLA': 0.0008,
                'CNC_3AXIS': 0.002,
                'LASER_2D': 0.0005,
            };
            var complexityMultipliers = {
                'simple': 1,
                'moderate': 1.3,
                'complex': 1.8,
            };
            var baseRate = baseRates[processCode] || 0.001;
            var multiplier = complexityMultipliers[complexity] || 1;
            return volume * baseRate * multiplier;
        };
        QuoteCalculationProcessor_1.prototype.getMarginRate = function (quantity, complexity, pricingConfig) {
            var baseMargin = pricingConfig.defaultMargin || 0.3;
            // Volume discount
            if (quantity >= 100) {
                baseMargin *= 0.8;
            }
            else if (quantity >= 50) {
                baseMargin *= 0.9;
            }
            // Complexity adjustment
            if (complexity === 'complex') {
                baseMargin *= 1.2;
            }
            else if (complexity === 'simple') {
                baseMargin *= 0.9;
            }
            return Math.max(baseMargin, pricingConfig.minimumMargin || 0.15);
        };
        QuoteCalculationProcessor_1.prototype.estimateLeadTime = function (totalMachineTime, processCode) {
            // Base lead times in days
            var baseLeadTimes = {
                'FFF': 2,
                'SLA': 3,
                'CNC_3AXIS': 5,
                'LASER_2D': 2,
            };
            var baseDays = baseLeadTimes[processCode] || 3;
            var productionDays = Math.ceil(totalMachineTime / 8); // 8 hours per day
            return baseDays + productionDays;
        };
        QuoteCalculationProcessor_1.prototype.calculateQuoteSummary = function (items, rushOrder, currency, pricingConfig) {
            return __awaiter(this, void 0, void 0, function () {
                var subtotal, rushFee, volumeDiscount, totalQuantity, taxableAmount, taxRate, tax, total, validityDays, validUntil;
                return __generator(this, function (_a) {
                    subtotal = items.reduce(function (sum, item) { return sum + item.totalPrice; }, 0);
                    rushFee = 0;
                    if (rushOrder) {
                        rushFee = subtotal * (pricingConfig.rushOrderRate || 0.25);
                    }
                    volumeDiscount = 0;
                    totalQuantity = items.reduce(function (sum, _item) { return sum + 1; }, 0);
                    if (totalQuantity >= 100) {
                        volumeDiscount = subtotal * 0.1;
                    }
                    else if (totalQuantity >= 50) {
                        volumeDiscount = subtotal * 0.05;
                    }
                    taxableAmount = subtotal + rushFee - volumeDiscount;
                    taxRate = pricingConfig.taxRate || 0.16;
                    tax = taxableAmount * taxRate;
                    total = taxableAmount + tax;
                    validityDays = pricingConfig.quoteValidityDays || 14;
                    validUntil = new Date();
                    validUntil.setDate(validUntil.getDate() + validityDays);
                    return [2 /*return*/, {
                            subtotal: Math.round(subtotal * 100) / 100,
                            rushFee: rushFee > 0 ? Math.round(rushFee * 100) / 100 : undefined,
                            volumeDiscount: volumeDiscount > 0 ? Math.round(volumeDiscount * 100) / 100 : undefined,
                            tax: Math.round(tax * 100) / 100,
                            total: Math.round(total * 100) / 100,
                            currency: currency,
                            validUntil: validUntil,
                        }];
                });
            });
        };
        QuoteCalculationProcessor_1.prototype.saveCalculationResults = function (quoteId, items, summary, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var _i, items_2, item;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: 
                                        // Update quote with calculated values
                                        return [4 /*yield*/, tx.quote.update({
                                                where: {
                                                    id: quoteId,
                                                    tenantId: tenantId,
                                                },
                                                data: {
                                                    status: 'CALCULATED',
                                                    subtotal: summary.subtotal,
                                                    tax: summary.tax,
                                                    total: summary.total,
                                                    currency: summary.currency,
                                                    validUntil: summary.validUntil,
                                                    metadata: {
                                                        rushFee: summary.rushFee,
                                                        volumeDiscount: summary.volumeDiscount,
                                                        calculatedAt: new Date(),
                                                    },
                                                },
                                            })];
                                        case 1:
                                            // Update quote with calculated values
                                            _a.sent();
                                            _i = 0, items_2 = items;
                                            _a.label = 2;
                                        case 2:
                                            if (!(_i < items_2.length)) return [3 /*break*/, 5];
                                            item = items_2[_i];
                                            return [4 /*yield*/, tx.quoteItem.updateMany({
                                                    where: {
                                                        quoteId: quoteId,
                                                        fileId: item.fileId,
                                                    },
                                                    data: {
                                                        unitPrice: item.unitPrice,
                                                        totalPrice: item.totalPrice,
                                                        leadTime: item.leadTime,
                                                        metadata: {
                                                            materialCost: item.materialCost,
                                                            laborCost: item.laborCost,
                                                            overheadCost: item.overheadCost,
                                                            margin: item.margin,
                                                        },
                                                    },
                                                })];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4:
                                            _i++;
                                            return [3 /*break*/, 2];
                                        case 5: return [2 /*return*/];
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
        QuoteCalculationProcessor_1.prototype.getAdjustments = function (summary) {
            var adjustments = [];
            if (summary.rushFee) {
                adjustments.push({
                    type: 'rush-order',
                    amount: summary.rushFee,
                    reason: 'Rush order processing',
                });
            }
            if (summary.volumeDiscount) {
                adjustments.push({
                    type: 'volume-discount',
                    amount: -summary.volumeDiscount,
                    reason: 'Volume discount applied',
                });
            }
            adjustments.push({
                type: 'tax',
                amount: summary.tax,
                reason: 'Sales tax',
            });
            return adjustments;
        };
        return QuoteCalculationProcessor_1;
    }());
    __setFunctionName(_classThis, "QuoteCalculationProcessor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleQuoteCalculation_decorators = [(0, bull_1.Process)()];
        _onActive_decorators = [(0, bull_1.OnQueueActive)()];
        _onComplete_decorators = [(0, bull_1.OnQueueCompleted)()];
        _onFailed_decorators = [(0, bull_1.OnQueueFailed)()];
        __esDecorate(_classThis, null, _handleQuoteCalculation_decorators, { kind: "method", name: "handleQuoteCalculation", static: false, private: false, access: { has: function (obj) { return "handleQuoteCalculation" in obj; }, get: function (obj) { return obj.handleQuoteCalculation; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onActive_decorators, { kind: "method", name: "onActive", static: false, private: false, access: { has: function (obj) { return "onActive" in obj; }, get: function (obj) { return obj.onActive; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onComplete_decorators, { kind: "method", name: "onComplete", static: false, private: false, access: { has: function (obj) { return "onComplete" in obj; }, get: function (obj) { return obj.onComplete; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onFailed_decorators, { kind: "method", name: "onFailed", static: false, private: false, access: { has: function (obj) { return "onFailed" in obj; }, get: function (obj) { return obj.onFailed; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QuoteCalculationProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QuoteCalculationProcessor = _classThis;
}();
exports.QuoteCalculationProcessor = QuoteCalculationProcessor;
