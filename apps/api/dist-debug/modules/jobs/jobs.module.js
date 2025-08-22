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
exports.JobsModule = void 0;
var common_1 = require("@nestjs/common");
var bull_1 = require("@nestjs/bull");
var config_1 = require("@nestjs/config");
var axios_1 = require("@nestjs/axios");
var job_interface_1 = require("./interfaces/job.interface");
var jobs_service_1 = require("./jobs.service");
var jobs_controller_1 = require("./jobs.controller");
var file_analysis_processor_1 = require("./processors/file-analysis.processor");
var quote_calculation_processor_1 = require("./processors/quote-calculation.processor");
var email_notification_processor_1 = require("./processors/email-notification.processor");
var report_generation_processor_1 = require("./processors/report-generation.processor");
var redis_module_1 = require("@/modules/redis/redis.module");
var prisma_module_1 = require("@/prisma/prisma.module");
var tenant_module_1 = require("@/modules/tenant/tenant.module");
var logger_module_1 = require("@/common/logger/logger.module");
var files_module_1 = require("@/modules/files/files.module");
var quotes_module_1 = require("@/modules/quotes/quotes.module");
var pricing_module_1 = require("@/modules/pricing/pricing.module");
var JobsModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule,
                // Register Bull queues
                bull_1.BullModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: function (configService) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, ({
                                    redis: configService.get('redis.url'),
                                    defaultJobOptions: {
                                        removeOnComplete: {
                                            age: 24 * 3600, // 24 hours
                                            count: 100, // Keep last 100 completed jobs
                                        },
                                        removeOnFail: {
                                            age: 7 * 24 * 3600, // 7 days
                                            count: 1000, // Keep last 1000 failed jobs
                                        },
                                        attempts: 3,
                                        backoff: {
                                            type: 'exponential',
                                            delay: 5000,
                                        },
                                    },
                                })];
                        });
                    }); },
                    inject: [config_1.ConfigService],
                }),
                // Register individual queues
                bull_1.BullModule.registerQueue({
                    name: job_interface_1.JobType.FILE_ANALYSIS,
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 5000,
                        },
                        timeout: 5 * 60 * 1000, // 5 minutes
                    },
                }, {
                    name: job_interface_1.JobType.QUOTE_CALCULATION,
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 3000,
                        },
                        timeout: 2 * 60 * 1000, // 2 minutes
                    },
                }, {
                    name: job_interface_1.JobType.EMAIL_NOTIFICATION,
                    defaultJobOptions: {
                        attempts: 5,
                        backoff: {
                            type: 'exponential',
                            delay: 10000,
                        },
                        timeout: 30 * 1000, // 30 seconds
                    },
                }, {
                    name: job_interface_1.JobType.REPORT_GENERATION,
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 5000,
                        },
                        timeout: 3 * 60 * 1000, // 3 minutes
                    },
                }),
                // Dead letter queue
                bull_1.BullModule.registerQueue({
                    name: 'dead-letter-queue',
                    defaultJobOptions: {
                        removeOnComplete: false,
                        removeOnFail: false,
                    },
                }),
                redis_module_1.RedisModule,
                prisma_module_1.PrismaModule,
                tenant_module_1.TenantModule,
                logger_module_1.LoggerModule,
                axios_1.HttpModule,
                files_module_1.FilesModule,
                quotes_module_1.QuotesModule,
                pricing_module_1.PricingModule,
            ],
            controllers: [jobs_controller_1.JobsController],
            providers: [
                jobs_service_1.JobsService,
                file_analysis_processor_1.FileAnalysisProcessor,
                quote_calculation_processor_1.QuoteCalculationProcessor,
                email_notification_processor_1.EmailNotificationProcessor,
                report_generation_processor_1.ReportGenerationProcessor,
            ],
            exports: [jobs_service_1.JobsService],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var JobsModule = _classThis = /** @class */ (function () {
        function JobsModule_1() {
        }
        return JobsModule_1;
    }());
    __setFunctionName(_classThis, "JobsModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        JobsModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return JobsModule = _classThis;
}();
exports.JobsModule = JobsModule;
