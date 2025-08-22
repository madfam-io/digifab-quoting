"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheEvict = exports.CachePut = exports.CacheInvalidate = exports.Cacheable = exports.CACHE_INVALIDATE_METADATA = exports.CACHE_OPTIONS_METADATA = exports.CACHE_KEY_METADATA = void 0;
var common_1 = require("@nestjs/common");
exports.CACHE_KEY_METADATA = 'cache_key_metadata';
exports.CACHE_OPTIONS_METADATA = 'cache_options_metadata';
exports.CACHE_INVALIDATE_METADATA = 'cache_invalidate_metadata';
/**
 * Decorator to cache method results
 * @param options Cache options
 */
var Cacheable = function (options) {
    return function (target, propertyKey, descriptor) {
        (0, common_1.SetMetadata)(exports.CACHE_OPTIONS_METADATA, options || {})(target, propertyKey, descriptor);
        var originalMethod = descriptor.value;
        if (!originalMethod)
            return descriptor;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var cacheService, keyPrefix, keyGenerator, cacheKey;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheService = this.cacheService || this.cache;
                            if (!cacheService) {
                                // No cache service available, execute method normally
                                return [2 /*return*/, originalMethod.apply(this, args)];
                            }
                            keyPrefix = (options === null || options === void 0 ? void 0 : options.prefix) || "".concat(target.constructor.name, ":").concat(String(propertyKey));
                            keyGenerator = (options === null || options === void 0 ? void 0 : options.keyGenerator) || defaultKeyGenerator;
                            cacheKey = keyGenerator.apply(void 0, __spreadArray([keyPrefix], args, false));
                            // Check condition
                            if ((options === null || options === void 0 ? void 0 : options.condition) && !options.condition.apply(options, args)) {
                                return [2 /*return*/, originalMethod.apply(this, args)];
                            }
                            return [4 /*yield*/, cacheService.getOrSet({
                                    key: cacheKey,
                                    ttl: options === null || options === void 0 ? void 0 : options.ttl,
                                    fetchFn: function () { return originalMethod.apply(_this, args); },
                                    tenantSpecific: true,
                                })];
                        case 1: 
                        // Apply cache-aside pattern
                        return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        return descriptor;
    };
};
exports.Cacheable = Cacheable;
/**
 * Decorator to invalidate cache
 * @param patterns Cache key patterns to invalidate
 */
var CacheInvalidate = function (patterns) {
    return function (target, propertyKey, descriptor) {
        (0, common_1.SetMetadata)(exports.CACHE_INVALIDATE_METADATA, patterns)(target, propertyKey, descriptor);
        var originalMethod = descriptor.value;
        if (!originalMethod)
            return descriptor;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var result, cacheService;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, originalMethod.apply(this, args)];
                        case 1:
                            result = _a.sent();
                            cacheService = this.cacheService || this.cache;
                            if (!cacheService) return [3 /*break*/, 3];
                            // Invalidate cache after successful execution
                            return [4 /*yield*/, cacheService.invalidate(patterns)];
                        case 2:
                            // Invalidate cache after successful execution
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/, result];
                    }
                });
            });
        };
        return descriptor;
    };
};
exports.CacheInvalidate = CacheInvalidate;
/**
 * Decorator to put result in cache
 * @param options Cache options
 */
var CachePut = function (options) {
    return function (target, propertyKey, descriptor) {
        var originalMethod = descriptor.value;
        if (!originalMethod)
            return descriptor;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var result, cacheService, keyPrefix, keyGenerator, cacheKey;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, originalMethod.apply(this, args)];
                        case 1:
                            result = _b.sent();
                            cacheService = this.cacheService || this.cache;
                            if (!(cacheService && result !== null && result !== undefined)) return [3 /*break*/, 3];
                            keyPrefix = (options === null || options === void 0 ? void 0 : options.prefix) || "".concat(target.constructor.name, ":").concat(String(propertyKey));
                            keyGenerator = (options === null || options === void 0 ? void 0 : options.keyGenerator) || defaultKeyGenerator;
                            cacheKey = keyGenerator.apply(void 0, __spreadArray([keyPrefix], args, false));
                            return [4 /*yield*/, cacheService.redisService.set(cacheKey, result, options === null || options === void 0 ? void 0 : options.ttl, { tenantId: (_a = this.tenantContext) === null || _a === void 0 ? void 0 : _a.getTenantId() })];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3: return [2 /*return*/, result];
                    }
                });
            });
        };
        return descriptor;
    };
};
exports.CachePut = CachePut;
/**
 * Decorator to evict cache
 * @param patterns Cache key patterns to evict
 */
var CacheEvict = function (patterns) {
    return function (_target, _propertyKey, descriptor) {
        var originalMethod = descriptor.value;
        if (!originalMethod)
            return descriptor;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var cacheService;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheService = this.cacheService || this.cache;
                            if (!cacheService) return [3 /*break*/, 2];
                            // Evict cache before execution
                            return [4 /*yield*/, cacheService.invalidate(patterns)];
                        case 1:
                            // Evict cache before execution
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/, originalMethod.apply(this, args)];
                    }
                });
            });
        };
        return descriptor;
    };
};
exports.CacheEvict = CacheEvict;
/**
 * Default key generator function
 */
function defaultKeyGenerator(prefix) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var argKey = args
        .map(function (arg) {
        if (typeof arg === 'object' && arg !== null) {
            return JSON.stringify(arg, Object.keys(arg).sort());
        }
        return String(arg);
    })
        .join(':');
    return "".concat(prefix, ":").concat(argKey);
}
