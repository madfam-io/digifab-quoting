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
exports.CacheController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("@/modules/auth/guards/jwt-auth.guard");
var roles_guard_1 = require("@/modules/auth/guards/roles.guard");
var roles_decorator_1 = require("@/modules/auth/decorators/roles.decorator");
var shared_1 = require("@madfam/shared");
var api_response_dto_1 = require("../../common/dto/api-response.dto");
var CacheController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('cache'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, common_1.Controller)('cache'), (0, swagger_1.ApiHeader)({
            name: 'X-Tenant-ID',
            description: 'Tenant identifier for multi-tenant operations',
            required: false
        }), (0, swagger_1.ApiForbiddenResponse)({
            description: 'Insufficient permissions',
            type: api_response_dto_1.ForbiddenResponseDto
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getHealth_decorators;
    var _getStatistics_decorators;
    var _resetStatistics_decorators;
    var _invalidatePattern_decorators;
    var _flushTenantCache_decorators;
    var _warmUpCache_decorators;
    var CacheController = _classThis = /** @class */ (function () {
        function CacheController_1(cacheService, redisService) {
            this.cacheService = (__runInitializers(this, _instanceExtraInitializers), cacheService);
            this.redisService = redisService;
        }
        CacheController_1.prototype.getHealth = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.cacheService.getHealthStatus()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        CacheController_1.prototype.getStatistics = function () {
            return this.redisService.getStatistics();
        };
        CacheController_1.prototype.resetStatistics = function () {
            this.redisService.resetStatistics();
            return {
                message: 'Statistics reset successfully',
                timestamp: new Date().toISOString()
            };
        };
        CacheController_1.prototype.invalidatePattern = function (pattern) {
            return __awaiter(this, void 0, void 0, function () {
                var deleted;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.cacheService.invalidate(pattern)];
                        case 1:
                            deleted = _a.sent();
                            return [2 /*return*/, {
                                    message: 'Cache invalidated successfully',
                                    keysDeleted: deleted,
                                    pattern: pattern
                                }];
                    }
                });
            });
        };
        CacheController_1.prototype.flushTenantCache = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.cacheService.invalidateTenantConfig()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    message: 'Tenant cache flushed successfully',
                                    timestamp: new Date().toISOString()
                                }];
                    }
                });
            });
        };
        CacheController_1.prototype.warmUpCache = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.cacheService.warmUpCache()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    message: 'Cache warm-up initiated',
                                    status: 'processing',
                                    estimatedTime: 30,
                                    items: ['materials', 'machines', 'process-options', 'tenant-config']
                                }];
                    }
                });
            });
        };
        return CacheController_1;
    }());
    __setFunctionName(_classThis, "CacheController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getHealth_decorators = [(0, common_1.Get)('health'), (0, swagger_1.ApiOperation)({
                summary: 'Get cache health status',
                description: 'Check Redis connection status and cache system health'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Cache health status',
                schema: {
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['healthy', 'degraded', 'unhealthy'],
                            example: 'healthy'
                        },
                        redis: {
                            type: 'object',
                            properties: {
                                connected: { type: 'boolean', example: true },
                                latency: { type: 'number', example: 2.5, description: 'Latency in milliseconds' },
                                memory: {
                                    type: 'object',
                                    properties: {
                                        used: { type: 'number', example: 52428800 },
                                        peak: { type: 'number', example: 104857600 },
                                        fragmentation: { type: 'number', example: 1.2 }
                                    }
                                },
                                version: { type: 'string', example: '7.0.5' }
                            }
                        },
                        uptime: { type: 'number', example: 86400, description: 'Uptime in seconds' },
                        lastCheck: { type: 'string', format: 'date-time' }
                    }
                }
            }), (0, roles_decorator_1.Roles)(shared_1.Role.ADMIN, shared_1.Role.MANAGER)];
        _getStatistics_decorators = [(0, common_1.Get)('statistics'), (0, swagger_1.ApiOperation)({
                summary: 'Get cache statistics',
                description: 'Retrieve detailed cache usage statistics including hit/miss ratios'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Cache statistics',
                schema: {
                    properties: {
                        hits: { type: 'number', example: 1234, description: 'Total cache hits' },
                        misses: { type: 'number', example: 456, description: 'Total cache misses' },
                        hitRate: { type: 'number', example: 73.0, description: 'Hit rate percentage' },
                        totalRequests: { type: 'number', example: 1690 },
                        avgGetTime: { type: 'number', example: 0.5, description: 'Average GET time in ms' },
                        avgSetTime: { type: 'number', example: 1.2, description: 'Average SET time in ms' },
                        memoryUsage: { type: 'number', example: 52428800, description: 'Memory usage in bytes' },
                        keyCount: { type: 'number', example: 789, description: 'Total number of keys' },
                        evictions: { type: 'number', example: 12, description: 'Number of evicted keys' },
                        connections: { type: 'number', example: 5, description: 'Active connections' },
                        breakdown: {
                            type: 'object',
                            additionalProperties: {
                                type: 'object',
                                properties: {
                                    hits: { type: 'number' },
                                    misses: { type: 'number' },
                                    hitRate: { type: 'number' }
                                }
                            },
                            example: {
                                'config:': { hits: 500, misses: 10, hitRate: 98.0 },
                                'quote:': { hits: 300, misses: 100, hitRate: 75.0 },
                                'file:': { hits: 434, misses: 346, hitRate: 55.6 }
                            }
                        },
                        lastReset: { type: 'string', format: 'date-time' }
                    }
                }
            }), (0, roles_decorator_1.Roles)(shared_1.Role.ADMIN, shared_1.Role.MANAGER)];
        _resetStatistics_decorators = [(0, common_1.Post)('statistics/reset'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({
                summary: 'Reset cache statistics',
                description: 'Reset all cache statistics counters to zero. Admin only.'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Statistics reset successfully',
                schema: {
                    properties: {
                        message: { type: 'string', example: 'Statistics reset successfully' },
                        timestamp: { type: 'string', format: 'date-time' }
                    }
                }
            }), (0, roles_decorator_1.Roles)(shared_1.Role.ADMIN)];
        _invalidatePattern_decorators = [(0, common_1.Delete)('invalidate/:pattern'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({
                summary: 'Invalidate cache by pattern',
                description: 'Delete all cache keys matching the specified pattern. Use with caution.'
            }), (0, swagger_1.ApiParam)({
                name: 'pattern',
                description: 'Redis key pattern (supports wildcards)',
                examples: {
                    'all-quotes': { value: 'quote:*' },
                    'specific-tenant': { value: 'tenant:123:*' },
                    'config-cache': { value: 'config:*' }
                }
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Cache invalidated successfully',
                schema: {
                    properties: {
                        message: { type: 'string', example: 'Cache invalidated successfully' },
                        keysDeleted: { type: 'number', example: 42, description: 'Number of keys deleted' },
                        pattern: { type: 'string', example: 'quote:*' }
                    }
                }
            }), (0, roles_decorator_1.Roles)(shared_1.Role.ADMIN)];
        _flushTenantCache_decorators = [(0, common_1.Delete)('tenant'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({
                summary: 'Flush current tenant cache',
                description: 'Clear all cache entries for the current tenant context'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Tenant cache flushed successfully',
                schema: {
                    properties: {
                        message: { type: 'string', example: 'Tenant cache flushed successfully' },
                        tenantId: { type: 'string', example: 'tenant_123' },
                        timestamp: { type: 'string', format: 'date-time' }
                    }
                }
            }), (0, roles_decorator_1.Roles)(shared_1.Role.ADMIN)];
        _warmUpCache_decorators = [(0, common_1.Post)('warmup'), (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED), (0, swagger_1.ApiOperation)({
                summary: 'Warm up cache with frequently accessed data',
                description: 'Pre-load cache with commonly accessed data to improve performance. This is an async operation.'
            }), (0, swagger_1.ApiResponse)({
                status: 202,
                description: 'Cache warm-up initiated',
                schema: {
                    properties: {
                        message: { type: 'string', example: 'Cache warm-up initiated' },
                        status: { type: 'string', example: 'processing' },
                        estimatedTime: { type: 'number', example: 30, description: 'Estimated completion time in seconds' },
                        items: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['materials', 'machines', 'process-options', 'tenant-config']
                        }
                    }
                }
            }), (0, roles_decorator_1.Roles)(shared_1.Role.ADMIN)];
        __esDecorate(_classThis, null, _getHealth_decorators, { kind: "method", name: "getHealth", static: false, private: false, access: { has: function (obj) { return "getHealth" in obj; }, get: function (obj) { return obj.getHealth; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStatistics_decorators, { kind: "method", name: "getStatistics", static: false, private: false, access: { has: function (obj) { return "getStatistics" in obj; }, get: function (obj) { return obj.getStatistics; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resetStatistics_decorators, { kind: "method", name: "resetStatistics", static: false, private: false, access: { has: function (obj) { return "resetStatistics" in obj; }, get: function (obj) { return obj.resetStatistics; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _invalidatePattern_decorators, { kind: "method", name: "invalidatePattern", static: false, private: false, access: { has: function (obj) { return "invalidatePattern" in obj; }, get: function (obj) { return obj.invalidatePattern; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _flushTenantCache_decorators, { kind: "method", name: "flushTenantCache", static: false, private: false, access: { has: function (obj) { return "flushTenantCache" in obj; }, get: function (obj) { return obj.flushTenantCache; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _warmUpCache_decorators, { kind: "method", name: "warmUpCache", static: false, private: false, access: { has: function (obj) { return "warmUpCache" in obj; }, get: function (obj) { return obj.warmUpCache; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CacheController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CacheController = _classThis;
}();
exports.CacheController = CacheController;
