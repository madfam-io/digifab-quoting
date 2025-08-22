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
exports.QuotesService = void 0;
var common_1 = require("@nestjs/common");
var cache_decorator_1 = require("../redis/decorators/cache.decorator");
var shared_1 = require("@madfam/shared");
var decimal_js_1 = require("decimal.js");
var QuotesService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findOne_decorators;
    var _update_decorators;
    var _cancel_decorators;
    var QuotesService = _classThis = /** @class */ (function () {
        function QuotesService_1(prisma, pricingService, quoteCacheService) {
            this.prisma = (__runInitializers(this, _instanceExtraInitializers), prisma);
            this.pricingService = pricingService;
            this.quoteCacheService = quoteCacheService;
        }
        QuotesService_1.prototype.create = function (tenantId, customerId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var validityDays, validityUntil, quoteNumber;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            validityDays = 14;
                            validityUntil = new Date();
                            validityUntil.setDate(validityUntil.getDate() + validityDays);
                            return [4 /*yield*/, this.generateQuoteNumber(tenantId)];
                        case 1:
                            quoteNumber = _a.sent();
                            return [2 /*return*/, this.prisma.quote.create({
                                    data: {
                                        tenantId: tenantId,
                                        customerId: customerId,
                                        number: quoteNumber,
                                        currency: dto.currency,
                                        objective: dto.objective,
                                        validityUntil: validityUntil,
                                        status: shared_1.QuoteStatus.DRAFT,
                                    },
                                })];
                    }
                });
            });
        };
        QuotesService_1.prototype.findAll = function (tenantId, filters) {
            return __awaiter(this, void 0, void 0, function () {
                var page, pageSize, skip, where, _a, items, total;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            page = filters.page || 1;
                            pageSize = filters.pageSize || 20;
                            skip = (page - 1) * pageSize;
                            where = __assign(__assign({ tenantId: tenantId }, (filters.customerId && { customerId: filters.customerId })), (filters.status && { status: filters.status }));
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.quote.findMany({
                                        where: where,
                                        include: {
                                            items: true,
                                            customer: {
                                                select: {
                                                    id: true,
                                                    email: true,
                                                    name: true,
                                                },
                                            },
                                        },
                                        skip: skip,
                                        take: pageSize,
                                        orderBy: { createdAt: 'desc' },
                                    }),
                                    this.prisma.quote.count({ where: where }),
                                ])];
                        case 1:
                            _a = _b.sent(), items = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    items: items,
                                    total: total,
                                    page: page,
                                    pageSize: pageSize,
                                    totalPages: Math.ceil(total / pageSize),
                                }];
                    }
                });
            });
        };
        QuotesService_1.prototype.findOne = function (tenantId, id) {
            return __awaiter(this, void 0, void 0, function () {
                var quote;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.quote.findFirst({
                                where: {
                                    id: id,
                                    tenantId: tenantId,
                                },
                                include: {
                                    items: {
                                        include: {
                                            files: true,
                                            dfmReport: true,
                                        },
                                    },
                                    customer: {
                                        select: {
                                            id: true,
                                            email: true,
                                            name: true,
                                        },
                                    },
                                },
                            })];
                        case 1:
                            quote = _a.sent();
                            if (!quote) {
                                throw new common_1.NotFoundException('Quote not found');
                            }
                            return [2 /*return*/, quote];
                    }
                });
            });
        };
        QuotesService_1.prototype.update = function (tenantId, id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var quote;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(tenantId, id)];
                        case 1:
                            quote = _a.sent();
                            if (quote.status !== shared_1.QuoteStatus.DRAFT && quote.status !== shared_1.QuoteStatus.SUBMITTED) {
                                throw new common_1.BadRequestException('Cannot update quote in current status');
                            }
                            return [2 /*return*/, this.prisma.quote.update({
                                    where: { id: id },
                                    data: {
                                        objective: dto.objective,
                                        metadata: dto.metadata,
                                    },
                                })];
                    }
                });
            });
        };
        QuotesService_1.prototype.addItem = function (tenantId, quoteId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var quote, file, quoteItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(tenantId, quoteId)];
                        case 1:
                            quote = _a.sent();
                            if (quote.status !== shared_1.QuoteStatus.DRAFT) {
                                throw new common_1.BadRequestException('Cannot add items to non-draft quote');
                            }
                            return [4 /*yield*/, this.prisma.file.findFirst({
                                    where: {
                                        id: dto.fileId,
                                        tenantId: tenantId,
                                    },
                                })];
                        case 2:
                            file = _a.sent();
                            if (!file) {
                                throw new common_1.NotFoundException('File not found');
                            }
                            return [4 /*yield*/, this.prisma.quoteItem.create({
                                    data: {
                                        quoteId: quoteId,
                                        name: dto.name || file.originalName,
                                        processCode: dto.process,
                                        quantity: dto.quantity,
                                        selections: dto.options,
                                    },
                                })];
                        case 3:
                            quoteItem = _a.sent();
                            // Associate file with quote item
                            return [4 /*yield*/, this.prisma.file.update({
                                    where: { id: dto.fileId },
                                    data: { quoteItemId: quoteItem.id },
                                })];
                        case 4:
                            // Associate file with quote item
                            _a.sent();
                            // Return the item with relations loaded
                            return [2 /*return*/, this.prisma.quoteItem.findUnique({
                                    where: { id: quoteItem.id },
                                    include: {
                                        files: true,
                                    },
                                })];
                    }
                });
            });
        };
        QuotesService_1.prototype.calculate = function (tenantId, quoteId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var quote, itemsToCalculate, calculatedItems, errors, _loop_1, this_1, _i, itemsToCalculate_1, item, totals, updatedQuote;
                var _this = this;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.findOne(tenantId, quoteId)];
                        case 1:
                            quote = _d.sent();
                            if (!dto.objective) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.quote.update({
                                    where: { id: quoteId },
                                    data: { objective: dto.objective },
                                })];
                        case 2:
                            _d.sent();
                            _d.label = 3;
                        case 3:
                            itemsToCalculate = dto.items || quote.items;
                            calculatedItems = [];
                            errors = [];
                            _loop_1 = function (item) {
                                var quoteItem_1, cacheKey, pricingResult, updatedItem, error_1, errorMessage;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            _e.trys.push([0, 7, , 8]);
                                            if (!item.id) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this_1.prisma.quoteItem.findFirst({
                                                    where: { id: item.id, quoteId: quoteId },
                                                    include: { files: true, dfmReport: true },
                                                })];
                                        case 1:
                                            quoteItem_1 = _e.sent();
                                            return [3 /*break*/, 4];
                                        case 2: return [4 /*yield*/, this_1.addItem(tenantId, quoteId, item)];
                                        case 3:
                                            // Create new item
                                            quoteItem_1 = _e.sent();
                                            _e.label = 4;
                                        case 4:
                                            if (!quoteItem_1) {
                                                throw new Error("Quote item not found for id: ".concat(item.id));
                                            }
                                            cacheKey = {
                                                fileHash: ((_b = (_a = quoteItem_1.files) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.hash) || '',
                                                service: quoteItem_1.processCode,
                                                material: ((_c = quoteItem_1.selections) === null || _c === void 0 ? void 0 : _c.material) || 'default',
                                                quantity: quoteItem_1.quantity,
                                                options: quoteItem_1.selections,
                                            };
                                            return [4 /*yield*/, this_1.quoteCacheService.getOrCalculateQuote(cacheKey, function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var result;
                                                    var _a, _b;
                                                    return __generator(this, function (_c) {
                                                        switch (_c.label) {
                                                            case 0: return [4 /*yield*/, this.pricingService.calculateQuoteItem(tenantId, quoteItem_1.processCode, {}, // geometryMetrics - placeholder
                                                                quoteItem_1.materialId || '', '', // machineId - placeholder
                                                                quoteItem_1.selections, quoteItem_1.quantity, quote.objective)];
                                                            case 1:
                                                                result = _c.sent();
                                                                return [2 /*return*/, {
                                                                        pricing: {
                                                                            unitCost: result.unitPrice,
                                                                            totalCost: result.totalPrice,
                                                                            margin: result.costBreakdown.margin,
                                                                            finalPrice: result.totalPrice,
                                                                        },
                                                                        manufacturing: {
                                                                            estimatedTime: result.leadDays,
                                                                            machineCost: ((_a = result.costBreakdown) === null || _a === void 0 ? void 0 : _a.machine) || 0,
                                                                            materialCost: ((_b = result.costBreakdown) === null || _b === void 0 ? void 0 : _b.material) || 0,
                                                                        },
                                                                        timestamp: Date.now(),
                                                                    }];
                                                        }
                                                    });
                                                }); })];
                                        case 5:
                                            pricingResult = _e.sent();
                                            return [4 /*yield*/, this_1.prisma.quoteItem.update({
                                                    where: { id: quoteItem_1.id },
                                                    data: {
                                                        unitPrice: pricingResult.pricing.unitCost,
                                                        totalPrice: pricingResult.pricing.totalCost,
                                                        leadDays: pricingResult.manufacturing.estimatedTime,
                                                        costBreakdown: {
                                                            machine: pricingResult.manufacturing.machineCost,
                                                            material: pricingResult.manufacturing.materialCost,
                                                        },
                                                        sustainability: {},
                                                        flags: [],
                                                    },
                                                })];
                                        case 6:
                                            updatedItem = _e.sent();
                                            calculatedItems.push(updatedItem);
                                            return [3 /*break*/, 8];
                                        case 7:
                                            error_1 = _e.sent();
                                            errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error occurred';
                                            errors.push({
                                                itemId: item.id,
                                                error: errorMessage,
                                            });
                                            return [3 /*break*/, 8];
                                        case 8: return [2 /*return*/];
                                    }
                                });
                            };
                            this_1 = this;
                            _i = 0, itemsToCalculate_1 = itemsToCalculate;
                            _d.label = 4;
                        case 4:
                            if (!(_i < itemsToCalculate_1.length)) return [3 /*break*/, 7];
                            item = itemsToCalculate_1[_i];
                            return [5 /*yield**/, _loop_1(item)];
                        case 5:
                            _d.sent();
                            _d.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 4];
                        case 7:
                            totals = this.calculateTotals(calculatedItems, quote.currency);
                            return [4 /*yield*/, this.prisma.quote.update({
                                    where: { id: quoteId },
                                    data: {
                                        status: errors.length > 0 ? shared_1.QuoteStatus.NEEDS_REVIEW : shared_1.QuoteStatus.AUTO_QUOTED,
                                        totals: totals,
                                        sustainability: this.calculateSustainabilitySummary(calculatedItems),
                                    },
                                    include: {
                                        items: {
                                            include: {
                                                files: true,
                                                dfmReport: true,
                                            },
                                        },
                                    },
                                })];
                        case 8:
                            updatedQuote = _d.sent();
                            return [2 /*return*/, {
                                    quote: updatedQuote,
                                    errors: errors.length > 0 ? errors : undefined,
                                }];
                    }
                });
            });
        };
        QuotesService_1.prototype.approve = function (tenantId, quoteId, customerId) {
            return __awaiter(this, void 0, void 0, function () {
                var quote;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(tenantId, quoteId)];
                        case 1:
                            quote = _a.sent();
                            if (quote.customerId !== customerId) {
                                throw new common_1.BadRequestException('Unauthorized to approve this quote');
                            }
                            if (quote.status !== shared_1.QuoteStatus.QUOTED && quote.status !== shared_1.QuoteStatus.AUTO_QUOTED) {
                                throw new common_1.BadRequestException('Quote cannot be approved in current status');
                            }
                            if (new Date(quote.validityUntil) < new Date()) {
                                throw new common_1.BadRequestException('Quote has expired');
                            }
                            return [2 /*return*/, this.prisma.quote.update({
                                    where: { id: quoteId },
                                    data: { status: shared_1.QuoteStatus.APPROVED },
                                })];
                    }
                });
            });
        };
        QuotesService_1.prototype.cancel = function (tenantId, quoteId) {
            return __awaiter(this, void 0, void 0, function () {
                var quote, allowedStatuses;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(tenantId, quoteId)];
                        case 1:
                            quote = _a.sent();
                            allowedStatuses = [
                                shared_1.QuoteStatus.DRAFT,
                                shared_1.QuoteStatus.SUBMITTED,
                                shared_1.QuoteStatus.AUTO_QUOTED,
                                shared_1.QuoteStatus.QUOTED,
                                shared_1.QuoteStatus.NEEDS_REVIEW,
                            ];
                            if (!allowedStatuses.includes(quote.status)) {
                                throw new common_1.BadRequestException('Quote cannot be cancelled in current status');
                            }
                            return [2 /*return*/, this.prisma.quote.update({
                                    where: { id: quoteId },
                                    data: { status: shared_1.QuoteStatus.CANCELLED },
                                })];
                    }
                });
            });
        };
        QuotesService_1.prototype.calculateTotals = function (items, currency) {
            var subtotal = items.reduce(function (sum, item) { return sum.plus(new decimal_js_1.Decimal(item.totalPrice || 0)); }, new decimal_js_1.Decimal(0));
            // TODO: Calculate tax based on tenant configuration
            var taxRate = new decimal_js_1.Decimal(0.16); // 16% IVA
            var tax = subtotal.mul(taxRate);
            // TODO: Calculate shipping
            var shipping = new decimal_js_1.Decimal(0);
            var grandTotal = subtotal.plus(tax).plus(shipping);
            return {
                subtotal: subtotal.toNumber(),
                tax: tax.toNumber(),
                shipping: shipping.toNumber(),
                grandTotal: grandTotal.toNumber(),
                currency: currency,
            };
        };
        QuotesService_1.prototype.calculateSustainabilitySummary = function (items) {
            if (items.length === 0)
                return null;
            var totalCo2e = items.reduce(function (sum, item) { var _a; return sum.plus(new decimal_js_1.Decimal(((_a = item.sustainability) === null || _a === void 0 ? void 0 : _a.co2eKg) || 0)); }, new decimal_js_1.Decimal(0));
            var avgScore = items.reduce(function (sum, item) { var _a; return sum + (((_a = item.sustainability) === null || _a === void 0 ? void 0 : _a.score) || 0); }, 0) / items.length;
            var totalEnergyKwh = items.reduce(function (sum, item) { var _a; return sum.plus(new decimal_js_1.Decimal(((_a = item.sustainability) === null || _a === void 0 ? void 0 : _a.energyKwh) || 0)); }, new decimal_js_1.Decimal(0));
            return {
                score: Math.round(avgScore),
                co2eKg: totalCo2e.toNumber(),
                energyKwh: totalEnergyKwh.toNumber(),
            };
        };
        QuotesService_1.prototype.generateQuoteNumber = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var now, year, month, startOfMonth, endOfMonth, count, sequence;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            now = new Date();
                            year = now.getFullYear();
                            month = String(now.getMonth() + 1).padStart(2, '0');
                            startOfMonth = new Date(year, now.getMonth(), 1);
                            endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);
                            return [4 /*yield*/, this.prisma.quote.count({
                                    where: {
                                        tenantId: tenantId,
                                        createdAt: {
                                            gte: startOfMonth,
                                            lte: endOfMonth,
                                        },
                                    },
                                })];
                        case 1:
                            count = _a.sent();
                            sequence = String(count + 1).padStart(4, '0');
                            return [2 /*return*/, "Q-".concat(year, "-").concat(month, "-").concat(sequence)];
                    }
                });
            });
        };
        return QuotesService_1;
    }());
    __setFunctionName(_classThis, "QuotesService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findOne_decorators = [(0, cache_decorator_1.Cacheable)({ prefix: 'quote:detail', ttl: 300 })];
        _update_decorators = [(0, cache_decorator_1.CacheInvalidate)('quote:detail:*')];
        _cancel_decorators = [(0, cache_decorator_1.CacheInvalidate)('quote:detail:*')];
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: function (obj) { return "cancel" in obj; }, get: function (obj) { return obj.cancel; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QuotesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QuotesService = _classThis;
}();
exports.QuotesService = QuotesService;
