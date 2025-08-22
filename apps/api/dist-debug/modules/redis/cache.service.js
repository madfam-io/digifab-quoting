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
exports.CacheService = void 0;
var common_1 = require("@nestjs/common");
var crypto_1 = require("crypto");
var CacheService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var CacheService = _classThis = /** @class */ (function () {
        function CacheService_1(redisService, tenantContext, logger) {
            this.redisService = redisService;
            this.tenantContext = tenantContext;
            this.logger = logger;
        }
        /**
         * Cache-aside pattern implementation
         */
        CacheService_1.prototype.getOrSet = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached, data, metadata;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheKey = this.buildKey(options.key, options.tenantSpecific);
                            return [4 /*yield*/, this.redisService.get(cacheKey)];
                        case 1:
                            cached = _a.sent();
                            if (cached !== null) {
                                this.logger.debug("Cache hit for key: ".concat(cacheKey));
                                return [2 /*return*/, cached];
                            }
                            // Cache miss - fetch data
                            this.logger.debug("Cache miss for key: ".concat(cacheKey));
                            return [4 /*yield*/, options.fetchFn()];
                        case 2:
                            data = _a.sent();
                            metadata = {
                                tenantId: options.tenantSpecific ? this.tenantContext.getTenantId() : undefined,
                                version: options.version,
                            };
                            return [4 /*yield*/, this.redisService.set(cacheKey, data, options.ttl, metadata)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, data];
                    }
                });
            });
        };
        /**
         * Invalidate cache entries
         */
        CacheService_1.prototype.invalidate = function (patterns) {
            return __awaiter(this, void 0, void 0, function () {
                var patternsArray, totalDeleted, _i, patternsArray_1, pattern, fullPattern, deleted;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            patternsArray = Array.isArray(patterns) ? patterns : [patterns];
                            totalDeleted = 0;
                            _i = 0, patternsArray_1 = patternsArray;
                            _a.label = 1;
                        case 1:
                            if (!(_i < patternsArray_1.length)) return [3 /*break*/, 4];
                            pattern = patternsArray_1[_i];
                            fullPattern = this.buildKey(pattern, true);
                            return [4 /*yield*/, this.redisService.deletePattern(fullPattern)];
                        case 2:
                            deleted = _a.sent();
                            totalDeleted += deleted;
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            this.logger.log("Invalidated ".concat(totalDeleted, " cache entries"));
                            return [2 /*return*/, totalDeleted];
                    }
                });
            });
        };
        /**
         * Generate cache key for quote calculations
         */
        CacheService_1.prototype.generateQuoteKey = function (fileHash, configuration) {
            var configHash = this.hashObject(configuration);
            return this.buildKey("quote:".concat(fileHash, ":").concat(configHash), true);
        };
        /**
         * Cache pricing rules with TTL
         */
        CacheService_1.prototype.cachePricingRules = function (service_1, material_1, rules_1) {
            return __awaiter(this, arguments, void 0, function (service, material, rules, ttl // 1 hour default
            ) {
                var key;
                if (ttl === void 0) { ttl = 3600; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = this.buildKey("pricing:rules:".concat(service, ":").concat(material), true);
                            return [4 /*yield*/, this.redisService.set(key, rules, ttl)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get cached pricing rules
         */
        CacheService_1.prototype.getCachedPricingRules = function (service, material) {
            return __awaiter(this, void 0, void 0, function () {
                var key;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = this.buildKey("pricing:rules:".concat(service, ":").concat(material), true);
                            return [4 /*yield*/, this.redisService.get(key)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Cache tenant configuration
         */
        CacheService_1.prototype.cacheTenantConfig = function (config_1) {
            return __awaiter(this, arguments, void 0, function (config, ttl) {
                var tenantId, key;
                if (ttl === void 0) { ttl = 1800; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tenantId = this.tenantContext.getTenantId();
                            key = "tenant:config:".concat(tenantId);
                            return [4 /*yield*/, this.redisService.set(key, config, ttl)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get cached tenant configuration
         */
        CacheService_1.prototype.getCachedTenantConfig = function () {
            return __awaiter(this, void 0, void 0, function () {
                var tenantId, key;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tenantId = this.tenantContext.getTenantId();
                            key = "tenant:config:".concat(tenantId);
                            return [4 /*yield*/, this.redisService.get(key)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Invalidate tenant configuration cache
         */
        CacheService_1.prototype.invalidateTenantConfig = function () {
            return __awaiter(this, void 0, void 0, function () {
                var tenantId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tenantId = this.tenantContext.getTenantId();
                            return [4 /*yield*/, this.redisService.delete("tenant:config:".concat(tenantId))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Cache user session data
         */
        CacheService_1.prototype.cacheUserSession = function (userId_1, sessionData_1) {
            return __awaiter(this, arguments, void 0, function (userId, sessionData, ttl // 15 minutes
            ) {
                var key;
                if (ttl === void 0) { ttl = 900; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = this.buildKey("session:".concat(userId), true);
                            return [4 /*yield*/, this.redisService.set(key, sessionData, ttl)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get cached user session
         */
        CacheService_1.prototype.getCachedUserSession = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var key;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = this.buildKey("session:".concat(userId), true);
                            return [4 /*yield*/, this.redisService.get(key)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Extend user session TTL
         */
        CacheService_1.prototype.extendUserSession = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, ttl) {
                var key;
                if (ttl === void 0) { ttl = 900; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = this.buildKey("session:".concat(userId), true);
                            return [4 /*yield*/, this.redisService.expire(key, ttl)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Get value from cache
         */
        CacheService_1.prototype.get = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.redisService.get(key)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Set value in cache
         */
        CacheService_1.prototype.set = function (key, value, ttl, metadata) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.redisService.set(key, value, ttl, metadata)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Cache quote calculation result
         */
        CacheService_1.prototype.cacheQuoteCalculation = function (fileHash_1, configuration_1, result_1) {
            return __awaiter(this, arguments, void 0, function (fileHash, configuration, result, ttl // 1 hour
            ) {
                var key;
                if (ttl === void 0) { ttl = 3600; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = this.generateQuoteKey(fileHash, configuration);
                            return [4 /*yield*/, this.redisService.set(key, result, ttl)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get cached quote calculation
         */
        CacheService_1.prototype.getCachedQuoteCalculation = function (fileHash, configuration) {
            return __awaiter(this, void 0, void 0, function () {
                var key;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = this.generateQuoteKey(fileHash, configuration);
                            return [4 /*yield*/, this.redisService.get(key)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Warm up cache with frequently accessed data
         */
        CacheService_1.prototype.warmUpCache = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.logger.log('Starting cache warm-up');
                    try {
                        // This method can be extended to pre-load frequently accessed data
                        // For now, it's a placeholder for future implementation
                        this.logger.log('Cache warm-up completed');
                    }
                    catch (error) {
                        this.logger.error('Error during cache warm-up', error);
                    }
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Get cache health status
         */
        CacheService_1.prototype.getHealthStatus = function () {
            return __awaiter(this, void 0, void 0, function () {
                var isConnected, statistics;
                return __generator(this, function (_a) {
                    isConnected = this.redisService.isConnected();
                    statistics = this.redisService.getStatistics();
                    return [2 /*return*/, {
                            status: isConnected ? 'healthy' : 'unhealthy',
                            connected: isConnected,
                            statistics: statistics,
                            uptime: Date.now() - statistics.lastReset.getTime(),
                        }];
                });
            });
        };
        /**
         * Build cache key with optional tenant isolation
         */
        CacheService_1.prototype.buildKey = function (key, tenantSpecific) {
            if (tenantSpecific === void 0) { tenantSpecific = false; }
            if (tenantSpecific) {
                var tenantId = this.tenantContext.getTenantId();
                if (tenantId) {
                    return "tenant:".concat(tenantId, ":").concat(key);
                }
            }
            return key;
        };
        /**
         * Generate hash for object (for cache key generation)
         */
        CacheService_1.prototype.hashObject = function (obj) {
            var str = JSON.stringify(obj, Object.keys(obj).sort());
            return (0, crypto_1.createHash)('md5').update(str).digest('hex').substring(0, 8);
        };
        return CacheService_1;
    }());
    __setFunctionName(_classThis, "CacheService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CacheService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CacheService = _classThis;
}();
exports.CacheService = CacheService;
