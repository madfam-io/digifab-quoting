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
exports.PricingService = void 0;
var common_1 = require("@nestjs/common");
var cache_decorator_1 = require("../redis/decorators/cache.decorator");
var decimal_js_1 = require("decimal.js");
var PricingService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getMaterials_decorators;
    var _getMachines_decorators;
    var _getProcessOptions_decorators;
    var _getTenantPricingConfig_decorators;
    var PricingService = _classThis = /** @class */ (function () {
        function PricingService_1(prisma) {
            this.prisma = (__runInitializers(this, _instanceExtraInitializers), prisma);
        }
        PricingService_1.prototype.calculateQuoteItem = function (tenantId, _process, geometryMetrics, materialId, machineId, _selections, quantity, _objective) {
            return __awaiter(this, void 0, void 0, function () {
                var material, machine, volumeCm3, materialCost, machineHours, machineCost, unitPrice, totalPrice;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.material.findFirst({
                                where: { id: materialId, tenantId: tenantId },
                            })];
                        case 1:
                            material = _c.sent();
                            return [4 /*yield*/, this.prisma.machine.findFirst({
                                    where: { id: machineId, tenantId: tenantId },
                                })];
                        case 2:
                            machine = _c.sent();
                            if (!material || !machine) {
                                throw new Error('Material or machine not found');
                            }
                            volumeCm3 = geometryMetrics.volumeCm3 || 1;
                            materialCost = new decimal_js_1.Decimal(volumeCm3).mul(((_a = material.costPerUnit) === null || _a === void 0 ? void 0 : _a.toString()) || '1').div(1000);
                            machineHours = volumeCm3 / 60;
                            machineCost = new decimal_js_1.Decimal(machineHours).mul(((_b = machine.hourlyRate) === null || _b === void 0 ? void 0 : _b.toString()) || '500');
                            unitPrice = materialCost.plus(machineCost).mul(1.5);
                            totalPrice = unitPrice.mul(quantity);
                            return [2 /*return*/, {
                                    unitPrice: unitPrice.toNumber(),
                                    totalPrice: totalPrice.toNumber(),
                                    leadDays: 5,
                                    costBreakdown: {
                                        material: materialCost.toNumber(),
                                        machine: machineCost.toNumber(),
                                        overhead: 0,
                                        margin: unitPrice.sub(materialCost).sub(machineCost).toNumber(),
                                    },
                                    sustainability: {
                                        score: 75,
                                        co2eKg: 0.5,
                                        recycledPercent: 20,
                                    },
                                }];
                    }
                });
            });
        };
        PricingService_1.prototype.getMaterials = function (tenantId, process) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    where = {
                        tenantId: tenantId,
                    };
                    if (process) {
                        where.processTypes = {
                            has: process,
                        };
                    }
                    return [2 /*return*/, this.prisma.material.findMany({
                            where: where,
                            orderBy: { name: 'asc' },
                        })];
                });
            });
        };
        PricingService_1.prototype.getMachines = function (tenantId, process) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    where = {
                        tenantId: tenantId,
                    };
                    if (process) {
                        where.processType = process;
                    }
                    return [2 /*return*/, this.prisma.machine.findMany({
                            where: where,
                            orderBy: { name: 'asc' },
                        })];
                });
            });
        };
        PricingService_1.prototype.getProcessOptions = function (tenantId, process) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    where = {
                        tenantId: tenantId,
                    };
                    if (process) {
                        where.process = process;
                    }
                    return [2 /*return*/, this.prisma.processOption.findMany({
                            where: where,
                            orderBy: { process: 'asc' },
                        })];
                });
            });
        };
        PricingService_1.prototype.getTenantPricingConfig = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var tenant, margins, defaultMargin;
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0: return [4 /*yield*/, this.prisma.tenant.findUnique({
                                where: { id: tenantId },
                                select: {
                                    settings: true,
                                    features: true,
                                },
                            })];
                        case 1:
                            tenant = _j.sent();
                            return [4 /*yield*/, this.prisma.margin.findMany({
                                    where: {
                                        tenantId: tenantId,
                                        active: true,
                                    },
                                })];
                        case 2:
                            margins = _j.sent();
                            defaultMargin = margins.find(function (m) { return m.type === 'default'; });
                            return [2 /*return*/, {
                                    defaultMargin: ((_a = defaultMargin === null || defaultMargin === void 0 ? void 0 : defaultMargin.marginPercent) === null || _a === void 0 ? void 0 : _a.toNumber()) || 0.3,
                                    minimumMargin: ((_b = defaultMargin === null || defaultMargin === void 0 ? void 0 : defaultMargin.floorPercent) === null || _b === void 0 ? void 0 : _b.toNumber()) || 0.15,
                                    targetMargin: ((_c = defaultMargin === null || defaultMargin === void 0 ? void 0 : defaultMargin.targetPercent) === null || _c === void 0 ? void 0 : _c.toNumber()) || 0.35,
                                    rushOrderRate: ((_d = tenant === null || tenant === void 0 ? void 0 : tenant.settings) === null || _d === void 0 ? void 0 : _d.rushOrderRate) || 0.25,
                                    overheadRate: ((_e = tenant === null || tenant === void 0 ? void 0 : tenant.settings) === null || _e === void 0 ? void 0 : _e.overheadRate) || 0.15,
                                    taxRate: ((_f = tenant === null || tenant === void 0 ? void 0 : tenant.settings) === null || _f === void 0 ? void 0 : _f.taxRate) || 0.16, // IVA in Mexico
                                    quoteValidityDays: ((_g = tenant === null || tenant === void 0 ? void 0 : tenant.settings) === null || _g === void 0 ? void 0 : _g.quoteValidityDays) || 14,
                                    volumeDiscountThresholds: ((_h = tenant === null || tenant === void 0 ? void 0 : tenant.settings) === null || _h === void 0 ? void 0 : _h.volumeDiscountThresholds) || {
                                        50: 0.05,
                                        100: 0.1,
                                        500: 0.15,
                                    },
                                }];
                    }
                });
            });
        };
        return PricingService_1;
    }());
    __setFunctionName(_classThis, "PricingService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getMaterials_decorators = [(0, cache_decorator_1.Cacheable)({ prefix: 'materials', ttl: 1800 })];
        _getMachines_decorators = [(0, cache_decorator_1.Cacheable)({ prefix: 'machines', ttl: 1800 })];
        _getProcessOptions_decorators = [(0, cache_decorator_1.Cacheable)({ prefix: 'process-options', ttl: 1800 })];
        _getTenantPricingConfig_decorators = [(0, cache_decorator_1.Cacheable)({ prefix: 'tenant-pricing-config', ttl: 3600 })];
        __esDecorate(_classThis, null, _getMaterials_decorators, { kind: "method", name: "getMaterials", static: false, private: false, access: { has: function (obj) { return "getMaterials" in obj; }, get: function (obj) { return obj.getMaterials; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMachines_decorators, { kind: "method", name: "getMachines", static: false, private: false, access: { has: function (obj) { return "getMachines" in obj; }, get: function (obj) { return obj.getMachines; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProcessOptions_decorators, { kind: "method", name: "getProcessOptions", static: false, private: false, access: { has: function (obj) { return "getProcessOptions" in obj; }, get: function (obj) { return obj.getProcessOptions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTenantPricingConfig_decorators, { kind: "method", name: "getTenantPricingConfig", static: false, private: false, access: { has: function (obj) { return "getTenantPricingConfig" in obj; }, get: function (obj) { return obj.getTenantPricingConfig; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PricingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PricingService = _classThis;
}();
exports.PricingService = PricingService;
