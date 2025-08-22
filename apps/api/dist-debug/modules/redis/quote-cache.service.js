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
exports.QuoteCacheService = void 0;
var common_1 = require("@nestjs/common");
var crypto_1 = require("crypto");
var QuoteCacheService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var QuoteCacheService = _classThis = /** @class */ (function () {
        // private readonly CONFIG_CACHE_TTL = 900; // 15 minutes - unused for now
        function QuoteCacheService_1(cacheService, redisService, logger) {
            this.cacheService = cacheService;
            this.redisService = redisService;
            this.logger = logger;
            this.QUOTE_CACHE_TTL = 3600; // 1 hour
            this.PRICING_CACHE_TTL = 1800; // 30 minutes
        }
        /**
         * Get or calculate quote with caching
         */
        QuoteCacheService_1.prototype.getOrCalculateQuote = function (key, calculateFn) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheKey = this.generateQuoteCacheKey(key);
                            return [4 /*yield*/, this.cacheService.getOrSet({
                                    key: cacheKey,
                                    ttl: this.QUOTE_CACHE_TTL,
                                    fetchFn: calculateFn,
                                    tenantSpecific: true,
                                })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Cache quote calculation result
         */
        QuoteCacheService_1.prototype.cacheQuote = function (key, result) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheKey = this.generateQuoteCacheKey(key);
                            return [4 /*yield*/, this.redisService.set(cacheKey, result, this.QUOTE_CACHE_TTL, { tenantId: this.cacheService['tenantContext'].getTenantId() })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get cached quote
         */
        QuoteCacheService_1.prototype.getCachedQuote = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheKey = this.generateQuoteCacheKey(key);
                            return [4 /*yield*/, this.redisService.get(cacheKey)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Invalidate quotes for a specific file
         */
        QuoteCacheService_1.prototype.invalidateFileQuotes = function (fileHash) {
            return __awaiter(this, void 0, void 0, function () {
                var pattern;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            pattern = "quote:file:".concat(fileHash, ":*");
                            return [4 /*yield*/, this.cacheService.invalidate(pattern)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Invalidate quotes for a specific service/material combination
         */
        QuoteCacheService_1.prototype.invalidateServiceMaterialQuotes = function (service, material) {
            return __awaiter(this, void 0, void 0, function () {
                var pattern;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            pattern = "quote:*:".concat(service, ":").concat(material, ":*");
                            return [4 /*yield*/, this.cacheService.invalidate(pattern)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Cache pricing configuration
         */
        QuoteCacheService_1.prototype.cachePricingConfig = function (service, material, config) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.cacheService.cachePricingRules(service, material, config, this.PRICING_CACHE_TTL)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get cached pricing configuration
         */
        QuoteCacheService_1.prototype.getCachedPricingConfig = function (service, material) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.cacheService.getCachedPricingRules(service, material)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Batch get quotes
         */
        QuoteCacheService_1.prototype.batchGetQuotes = function (keys) {
            return __awaiter(this, void 0, void 0, function () {
                var results, client, pipeline, cacheKeys, responses, error_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            results = new Map();
                            client = this.redisService.getClient();
                            if (!client) {
                                return [2 /*return*/, results];
                            }
                            pipeline = client.pipeline();
                            cacheKeys = keys.map(function (key) { return _this.generateQuoteCacheKey(key); });
                            cacheKeys.forEach(function (key) {
                                pipeline.get(key);
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, pipeline.exec()];
                        case 2:
                            responses = _a.sent();
                            responses === null || responses === void 0 ? void 0 : responses.forEach(function (_a, index) {
                                var err = _a[0], value = _a[1];
                                if (!err && value) {
                                    try {
                                        var parsed = JSON.parse(value);
                                        results.set(cacheKeys[index], parsed.data);
                                    }
                                    catch (e) {
                                        results.set(cacheKeys[index], null);
                                    }
                                }
                                else {
                                    results.set(cacheKeys[index], null);
                                }
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            this.logger.error('Error in batch get quotes', error_1 instanceof Error ? error_1 : new Error(String(error_1)));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/, results];
                    }
                });
            });
        };
        /**
         * Warm up quote cache with common configurations
         */
        QuoteCacheService_1.prototype.warmUpQuoteCache = function (commonConfigs) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, commonConfigs_1, config;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log('Warming up quote cache');
                            _i = 0, commonConfigs_1 = commonConfigs;
                            _a.label = 1;
                        case 1:
                            if (!(_i < commonConfigs_1.length)) return [3 /*break*/, 4];
                            config = commonConfigs_1[_i];
                            // Pre-fetch pricing configurations
                            return [4 /*yield*/, this.getCachedPricingConfig(config.service, config.material)];
                        case 2:
                            // Pre-fetch pricing configurations
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get quote cache statistics
         */
        QuoteCacheService_1.prototype.getQuoteCacheStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var client, quoteKeys, pricingKeys, totalTTL, validKeys, _i, _a, key, ttl;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            client = this.redisService.getClient();
                            if (!client) {
                                return [2 /*return*/, {
                                        totalQuotes: 0,
                                        totalPricingConfigs: 0,
                                        averageTTL: 0,
                                    }];
                            }
                            return [4 /*yield*/, client.keys('*:quote:*')];
                        case 1:
                            quoteKeys = _b.sent();
                            return [4 /*yield*/, client.keys('*:pricing:*')];
                        case 2:
                            pricingKeys = _b.sent();
                            totalTTL = 0;
                            validKeys = 0;
                            _i = 0, _a = quoteKeys.slice(0, 100);
                            _b.label = 3;
                        case 3:
                            if (!(_i < _a.length)) return [3 /*break*/, 6];
                            key = _a[_i];
                            return [4 /*yield*/, this.redisService.ttl(key)];
                        case 4:
                            ttl = _b.sent();
                            if (ttl > 0) {
                                totalTTL += ttl;
                                validKeys++;
                            }
                            _b.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 3];
                        case 6: return [2 /*return*/, {
                                totalQuotes: quoteKeys.length,
                                totalPricingConfigs: pricingKeys.length,
                                averageTTL: validKeys > 0 ? totalTTL / validKeys : 0,
                            }];
                    }
                });
            });
        };
        /**
         * Generate quote cache key
         */
        QuoteCacheService_1.prototype.generateQuoteCacheKey = function (key) {
            var optionsHash = key.options
                ? this.hashObject(key.options)
                : 'default';
            return "quote:file:".concat(key.fileHash, ":").concat(key.service, ":").concat(key.material, ":").concat(key.quantity, ":").concat(optionsHash);
        };
        /**
         * Hash object for consistent key generation
         */
        QuoteCacheService_1.prototype.hashObject = function (obj) {
            var str = JSON.stringify(obj, Object.keys(obj).sort());
            return (0, crypto_1.createHash)('md5').update(str).digest('hex').substring(0, 8);
        };
        return QuoteCacheService_1;
    }());
    __setFunctionName(_classThis, "QuoteCacheService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QuoteCacheService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QuoteCacheService = _classThis;
}();
exports.QuoteCacheService = QuoteCacheService;
