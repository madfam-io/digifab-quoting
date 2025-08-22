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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var throttler_1 = require("@nestjs/throttler");
var core_1 = require("@nestjs/core");
var throttler_2 = require("@nestjs/throttler");
var configuration_1 = __importDefault(require("./config/configuration"));
var prisma_module_1 = require("./prisma/prisma.module");
var tenant_module_1 = require("./modules/tenant/tenant.module");
var tenant_context_middleware_1 = require("./modules/tenant/tenant-context.middleware");
var audit_module_1 = require("./modules/audit/audit.module");
var logger_module_1 = require("./common/logger/logger.module");
var redis_module_1 = require("./modules/redis/redis.module");
var auth_module_1 = require("./modules/auth/auth.module");
var users_module_1 = require("./modules/users/users.module");
var quotes_module_1 = require("./modules/quotes/quotes.module");
var files_module_1 = require("./modules/files/files.module");
var pricing_module_1 = require("./modules/pricing/pricing.module");
var admin_module_1 = require("./modules/admin/admin.module");
var health_module_1 = require("./modules/health/health.module");
var jobs_module_1 = require("./modules/jobs/jobs.module");
var AppModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    load: [configuration_1.default],
                }),
                throttler_1.ThrottlerModule.forRoot([{
                        ttl: 60000,
                        limit: 100,
                    }]),
                tenant_module_1.TenantModule,
                prisma_module_1.PrismaModule,
                logger_module_1.LoggerModule,
                redis_module_1.RedisModule,
                audit_module_1.AuditModule,
                auth_module_1.AuthModule,
                users_module_1.UsersModule,
                quotes_module_1.QuotesModule,
                files_module_1.FilesModule,
                pricing_module_1.PricingModule,
                admin_module_1.AdminModule,
                health_module_1.HealthModule,
                jobs_module_1.JobsModule,
            ],
            providers: [
                {
                    provide: core_1.APP_GUARD,
                    useClass: throttler_2.ThrottlerGuard,
                },
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppModule = _classThis = /** @class */ (function () {
        function AppModule_1() {
        }
        AppModule_1.prototype.configure = function (consumer) {
            consumer
                .apply(tenant_context_middleware_1.TenantContextMiddleware)
                .forRoutes('*');
        };
        return AppModule_1;
    }());
    __setFunctionName(_classThis, "AppModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
}();
exports.AppModule = AppModule;
