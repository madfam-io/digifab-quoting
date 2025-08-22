"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
// Models that should have tenant isolation
var TENANT_MODELS = [
    'User',
    'Customer',
    'Quote',
    'QuoteItem',
    'File',
    'Material',
    'Machine',
    'ProcessOption',
    'PricingRule',
    'Margin',
    'DiscountRule',
    'ShippingRate',
    'SupplierBid',
    'PaymentIntent',
    'AuditLog',
    'NDAAcceptance',
];
// Models that are global (no tenant isolation)
var GLOBAL_MODELS = ['Tenant', 'FXRate', 'Session'];
var PrismaService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = client_1.PrismaClient;
    var PrismaService = _classThis = /** @class */ (function (_super) {
        __extends(PrismaService_1, _super);
        function PrismaService_1(tenantContext) {
            var _this = _super.call(this, {
                log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            }) || this;
            _this.tenantContext = tenantContext;
            return _this;
        }
        PrismaService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.$connect()];
                        case 1:
                            _a.sent();
                            // Add middleware for multi-tenancy
                            this.$use(function (params, next) { return __awaiter(_this, void 0, void 0, function () {
                                var context;
                                var _a;
                                return __generator(this, function (_b) {
                                    // Skip for global models or transactions
                                    if (GLOBAL_MODELS.includes(params.model) || params.runInTransaction) {
                                        return [2 /*return*/, next(params)];
                                    }
                                    context = (_a = this.tenantContext) === null || _a === void 0 ? void 0 : _a.getContext();
                                    // For tenant-scoped models, enforce tenant isolation
                                    if (TENANT_MODELS.includes(params.model) && (context === null || context === void 0 ? void 0 : context.tenantId)) {
                                        // For create operations, add tenantId
                                        if (params.action === 'create') {
                                            params.args.data = __assign(__assign({}, params.args.data), { tenantId: context.tenantId });
                                        }
                                        // For createMany operations, add tenantId to each record
                                        if (params.action === 'createMany') {
                                            if (Array.isArray(params.args.data)) {
                                                params.args.data = params.args.data.map(function (item) { return (__assign(__assign({}, item), { tenantId: context.tenantId })); });
                                            }
                                            else {
                                                params.args.data = __assign(__assign({}, params.args.data), { tenantId: context.tenantId });
                                            }
                                        }
                                        // For all query operations, add tenant filter
                                        if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
                                            if (!params.args) {
                                                params.args = {};
                                            }
                                            if (!params.args.where) {
                                                params.args.where = {};
                                            }
                                            // Add tenant filter
                                            params.args.where = __assign(__assign({}, params.args.where), { tenantId: context.tenantId });
                                        }
                                        // For update operations, add tenant filter to prevent cross-tenant updates
                                        if (['update', 'updateMany', 'delete', 'deleteMany'].includes(params.action)) {
                                            if (!params.args.where) {
                                                params.args.where = {};
                                            }
                                            params.args.where = __assign(__assign({}, params.args.where), { tenantId: context.tenantId });
                                        }
                                        // For upsert operations, ensure both create and update respect tenant
                                        if (params.action === 'upsert') {
                                            params.args.create = __assign(__assign({}, params.args.create), { tenantId: context.tenantId });
                                            params.args.where = __assign(__assign({}, params.args.where), { tenantId: context.tenantId });
                                        }
                                    }
                                    return [2 /*return*/, next(params)];
                                });
                            }); });
                            return [2 /*return*/];
                    }
                });
            });
        };
        PrismaService_1.prototype.enableShutdownHooks = function (app) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    this.$on('beforeExit', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, app.close()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            });
        };
        PrismaService_1.prototype.cleanDatabase = function () {
            return __awaiter(this, void 0, void 0, function () {
                var models;
                var _this = this;
                return __generator(this, function (_a) {
                    if (process.env.NODE_ENV === 'production') {
                        throw new Error('cleanDatabase is not allowed in production');
                    }
                    models = Reflect.ownKeys(this).filter(function (key) {
                        var keyStr = String(key);
                        return keyStr[0] !== '_' && keyStr[0] !== '$' && keyStr !== 'constructor';
                    });
                    return [2 /*return*/, Promise.all(models.map(function (modelKey) {
                            var keyStr = String(modelKey);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            return _this[keyStr].deleteMany();
                        }))];
                });
            });
        };
        return PrismaService_1;
    }(_classSuper));
    __setFunctionName(_classThis, "PrismaService");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PrismaService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PrismaService = _classThis;
}();
exports.PrismaService = PrismaService;
