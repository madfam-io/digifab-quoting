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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
var common_1 = require("@nestjs/common");
var ioredis_1 = __importDefault(require("ioredis"));
var RedisService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RedisService = _classThis = /** @class */ (function () {
        function RedisService_1(configService, logger) {
            this.configService = configService;
            this.logger = logger;
            this.client = null;
            // private readonly defaultTTL = 3600; // 1 hour default - unused for now
            this.statistics = {
                hits: 0,
                misses: 0,
                sets: 0,
                deletes: 0,
                errors: 0,
                hitRate: 0,
                lastReset: new Date(),
            };
        }
        RedisService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var redisUrl, error_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            redisUrl = this.configService.get('redis.url');
                            if (!redisUrl) {
                                this.logger.warn('Redis URL not configured, Redis will not be available');
                                return [2 /*return*/];
                            }
                            this.client = new ioredis_1.default(redisUrl, {
                                maxRetriesPerRequest: 3,
                                enableReadyCheck: true,
                                lazyConnect: true,
                                retryStrategy: function (times) {
                                    var delay = Math.min(times * 50, 2000);
                                    return delay;
                                },
                            });
                            this.client.on('error', function (error) {
                                _this.logger.error('Redis connection error', error);
                                _this.statistics.errors++;
                            });
                            this.client.on('connect', function () {
                                _this.logger.log('Redis connected successfully');
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.client.connect()];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            this.logger.error('Failed to connect to Redis', error_1 instanceof Error ? error_1 : new Error(String(error_1)));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        RedisService_1.prototype.onModuleDestroy = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.client) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.client.quit()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Generate a cache key with tenant isolation
         */
        RedisService_1.prototype.generateKey = function (options) {
            var parts = [options.prefix];
            if (options.tenantId) {
                parts.push("tenant:".concat(options.tenantId));
            }
            if (Array.isArray(options.identifier)) {
                parts.push.apply(parts, options.identifier);
            }
            else {
                parts.push(options.identifier);
            }
            return parts.join(':');
        };
        /**
         * Get a value from cache
         */
        RedisService_1.prototype.get = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var value, entry, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.client) {
                                return [2 /*return*/, null];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            return [4 /*yield*/, this.client.get(key)];
                        case 2:
                            value = _a.sent();
                            if (!value) {
                                this.statistics.misses++;
                                return [2 /*return*/, null];
                            }
                            entry = JSON.parse(value);
                            if (!(entry.metadata.expiresAt && entry.metadata.expiresAt < Date.now())) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.delete(key)];
                        case 3:
                            _a.sent();
                            this.statistics.misses++;
                            return [2 /*return*/, null];
                        case 4:
                            this.statistics.hits++;
                            this.updateHitRate();
                            return [2 /*return*/, entry.data];
                        case 5:
                            error_2 = _a.sent();
                            this.logger.error("Error getting cache key ".concat(key), error_2 instanceof Error ? error_2 : new Error(String(error_2)));
                            this.statistics.errors++;
                            return [2 /*return*/, null];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Set a value in cache
         */
        RedisService_1.prototype.set = function (key, value, ttl, metadata) {
            return __awaiter(this, void 0, void 0, function () {
                var entry, serialized, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.client) {
                                return [2 /*return*/, false];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 6, , 7]);
                            entry = {
                                data: value,
                                metadata: __assign({ createdAt: Date.now(), expiresAt: ttl ? Date.now() + (ttl * 1000) : undefined }, metadata),
                            };
                            serialized = JSON.stringify(entry);
                            if (!ttl) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.client.setex(key, ttl, serialized)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.client.set(key, serialized)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            this.statistics.sets++;
                            return [2 /*return*/, true];
                        case 6:
                            error_3 = _a.sent();
                            this.logger.error("Error setting cache key ".concat(key), error_3 instanceof Error ? error_3 : new Error(String(error_3)));
                            this.statistics.errors++;
                            return [2 /*return*/, false];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Delete a value from cache
         */
        RedisService_1.prototype.delete = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var keys, result, error_4;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.client) {
                                return [2 /*return*/, 0];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            keys = Array.isArray(key) ? key : [key];
                            return [4 /*yield*/, (_a = this.client).del.apply(_a, keys)];
                        case 2:
                            result = _b.sent();
                            this.statistics.deletes += result;
                            return [2 /*return*/, result];
                        case 3:
                            error_4 = _b.sent();
                            this.logger.error("Error deleting cache key(s) ".concat(key), error_4 instanceof Error ? error_4 : new Error(String(error_4)));
                            this.statistics.errors++;
                            return [2 /*return*/, 0];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Delete all keys matching a pattern
         */
        RedisService_1.prototype.deletePattern = function (pattern) {
            return __awaiter(this, void 0, void 0, function () {
                var keys, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.client) {
                                return [2 /*return*/, 0];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, this.client.keys(pattern)];
                        case 2:
                            keys = _a.sent();
                            if (keys.length === 0)
                                return [2 /*return*/, 0];
                            return [4 /*yield*/, this.delete(keys)];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4:
                            error_5 = _a.sent();
                            this.logger.error("Error deleting cache pattern ".concat(pattern), error_5 instanceof Error ? error_5 : new Error(String(error_5)));
                            this.statistics.errors++;
                            return [2 /*return*/, 0];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Check if a key exists
         */
        RedisService_1.prototype.exists = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.client) {
                                return [2 /*return*/, false];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.client.exists(key)];
                        case 2:
                            result = _a.sent();
                            return [2 /*return*/, result === 1];
                        case 3:
                            error_6 = _a.sent();
                            this.logger.error("Error checking cache key existence ".concat(key), error_6 instanceof Error ? error_6 : new Error(String(error_6)));
                            return [2 /*return*/, false];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get remaining TTL for a key
         */
        RedisService_1.prototype.ttl = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.client) {
                                return [2 /*return*/, -1];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.client.ttl(key)];
                        case 2: return [2 /*return*/, _a.sent()];
                        case 3:
                            error_7 = _a.sent();
                            this.logger.error("Error getting TTL for cache key ".concat(key), error_7 instanceof Error ? error_7 : new Error(String(error_7)));
                            return [2 /*return*/, -1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Extend TTL for a key
         */
        RedisService_1.prototype.expire = function (key, ttl) {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.client) {
                                return [2 /*return*/, false];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.client.expire(key, ttl)];
                        case 2:
                            result = _a.sent();
                            return [2 /*return*/, result === 1];
                        case 3:
                            error_8 = _a.sent();
                            this.logger.error("Error setting expiry for cache key ".concat(key), error_8 instanceof Error ? error_8 : new Error(String(error_8)));
                            return [2 /*return*/, false];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Flush all cache (use with caution)
         */
        RedisService_1.prototype.flushAll = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.client) {
                                return [2 /*return*/];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.client.flushall()];
                        case 2:
                            _a.sent();
                            this.logger.warn('All cache flushed');
                            return [3 /*break*/, 4];
                        case 3:
                            error_9 = _a.sent();
                            this.logger.error('Error flushing cache', error_9 instanceof Error ? error_9 : new Error(String(error_9)));
                            this.statistics.errors++;
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Flush cache for specific tenant
         */
        RedisService_1.prototype.flushTenant = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.deletePattern("*:tenant:".concat(tenantId, ":*"))];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Get cache statistics
         */
        RedisService_1.prototype.getStatistics = function () {
            return __assign({}, this.statistics);
        };
        /**
         * Reset cache statistics
         */
        RedisService_1.prototype.resetStatistics = function () {
            this.statistics = {
                hits: 0,
                misses: 0,
                sets: 0,
                deletes: 0,
                errors: 0,
                hitRate: 0,
                lastReset: new Date(),
            };
        };
        /**
         * Execute Redis command directly (for advanced use)
         */
        RedisService_1.prototype.execute = function (command) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var error_10;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.client) {
                                throw new Error('Redis client not initialized');
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, (_a = this.client).call.apply(_a, __spreadArray([command], args, false))];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            error_10 = _b.sent();
                            this.logger.error("Error executing Redis command ".concat(command), error_10 instanceof Error ? error_10 : new Error(String(error_10)));
                            this.statistics.errors++;
                            throw error_10;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get the Redis client instance
         */
        RedisService_1.prototype.getClient = function () {
            return this.client;
        };
        /**
         * Check if Redis is connected
         */
        RedisService_1.prototype.isConnected = function () {
            return !!this.client && this.client.status === 'ready';
        };
        RedisService_1.prototype.updateHitRate = function () {
            var total = this.statistics.hits + this.statistics.misses;
            this.statistics.hitRate = total > 0 ? (this.statistics.hits / total) * 100 : 0;
        };
        return RedisService_1;
    }());
    __setFunctionName(_classThis, "RedisService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RedisService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RedisService = _classThis;
}();
exports.RedisService = RedisService;
