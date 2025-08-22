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
exports.JobsController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("@/modules/auth/guards/jwt-auth.guard");
var roles_guard_1 = require("@/modules/auth/guards/roles.guard");
var roles_decorator_1 = require("@/modules/auth/decorators/roles.decorator");
var job_interface_1 = require("./interfaces/job.interface");
var job_dto_1 = require("./dto/job.dto");
var JobsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('jobs'), (0, common_1.Controller)('jobs'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized - Invalid or missing JWT token'
        }), (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.FORBIDDEN,
            description: 'Forbidden - Insufficient permissions'
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _createJob_decorators;
    var _scheduleJob_decorators;
    var _createRecurringJob_decorators;
    var _getJobStatus_decorators;
    var _getJobs_decorators;
    var _retryJob_decorators;
    var _cancelJob_decorators;
    var _moveToDeadLetter_decorators;
    var _getQueueMetrics_decorators;
    var _pauseQueue_decorators;
    var _resumeQueue_decorators;
    var _cleanQueue_decorators;
    var _checkHealth_decorators;
    var JobsController = _classThis = /** @class */ (function () {
        function JobsController_1(jobsService) {
            this.jobsService = (__runInitializers(this, _instanceExtraInitializers), jobsService);
        }
        JobsController_1.prototype.createJob = function (createJobDto, tenantId, user) {
            return __awaiter(this, void 0, void 0, function () {
                var job;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.jobsService.addJob(createJobDto.type, __assign(__assign({}, createJobDto.data), { tenantId: tenantId, userId: user.id }), createJobDto.options)];
                        case 1:
                            job = _b.sent();
                            _a = {
                                jobId: job.id,
                                type: job.name
                            };
                            return [4 /*yield*/, job.getState()];
                        case 2: return [2 /*return*/, (_a.status = _b.sent(),
                                _a.createdAt = new Date(job.timestamp),
                                _a)];
                    }
                });
            });
        };
        JobsController_1.prototype.scheduleJob = function (scheduleJobDto, tenantId, user) {
            return __awaiter(this, void 0, void 0, function () {
                var job;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.jobsService.scheduleJob(scheduleJobDto.type, __assign(__assign({}, scheduleJobDto.data), { tenantId: tenantId, userId: user.id }), scheduleJobDto.delay, scheduleJobDto.options)];
                        case 1:
                            job = _b.sent();
                            _a = {
                                jobId: job.id,
                                type: job.name
                            };
                            return [4 /*yield*/, job.getState()];
                        case 2: return [2 /*return*/, (_a.status = _b.sent(),
                                _a.scheduledFor = new Date(Date.now() + scheduleJobDto.delay),
                                _a)];
                    }
                });
            });
        };
        JobsController_1.prototype.createRecurringJob = function (recurringJobDto, tenantId, user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jobsService.addRecurringJob(recurringJobDto.type, __assign(__assign({}, recurringJobDto.data), { tenantId: tenantId, userId: user.id }), recurringJobDto.cronExpression, recurringJobDto.options)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    message: 'Recurring job created successfully',
                                    type: recurringJobDto.type,
                                    cron: recurringJobDto.cronExpression,
                                }];
                    }
                });
            });
        };
        JobsController_1.prototype.getJobStatus = function (jobId) {
            return __awaiter(this, void 0, void 0, function () {
                var status;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jobsService.getJobStatus(jobId)];
                        case 1:
                            status = _a.sent();
                            if (!status) {
                                throw new Error('Job not found');
                            }
                            return [2 /*return*/, status];
                    }
                });
            });
        };
        JobsController_1.prototype.getJobs = function (query, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.jobsService.getJobsByTenant(tenantId, {
                            type: query.type,
                            status: query.status,
                            limit: query.limit,
                            offset: query.offset,
                        })];
                });
            });
        };
        JobsController_1.prototype.retryJob = function (jobId) {
            return __awaiter(this, void 0, void 0, function () {
                var job;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jobsService.retryJob(jobId)];
                        case 1:
                            job = _a.sent();
                            if (!job) {
                                throw new Error('Job not found or not in failed state');
                            }
                            return [2 /*return*/, {
                                    jobId: job.id,
                                    message: 'Job retried successfully',
                                    attempts: job.attemptsMade,
                                }];
                    }
                });
            });
        };
        JobsController_1.prototype.cancelJob = function (jobId) {
            return __awaiter(this, void 0, void 0, function () {
                var cancelled;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jobsService.cancelJob(jobId)];
                        case 1:
                            cancelled = _a.sent();
                            return [2 /*return*/, {
                                    jobId: jobId,
                                    cancelled: cancelled,
                                    message: cancelled ? 'Job cancelled successfully' : 'Job not found',
                                }];
                    }
                });
            });
        };
        JobsController_1.prototype.moveToDeadLetter = function (jobId, reason) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jobsService.moveToDeadLetter(jobId, reason)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    jobId: jobId,
                                    message: 'Job moved to dead letter queue',
                                    reason: reason,
                                }];
                    }
                });
            });
        };
        JobsController_1.prototype.getQueueMetrics = function (type) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.jobsService.getQueueMetrics(type)];
                });
            });
        };
        JobsController_1.prototype.pauseQueue = function (type) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jobsService.pauseQueue(type)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    queue: type,
                                    status: 'paused',
                                    message: 'Queue paused successfully',
                                }];
                    }
                });
            });
        };
        JobsController_1.prototype.resumeQueue = function (type) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jobsService.resumeQueue(type)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    queue: type,
                                    status: 'active',
                                    message: 'Queue resumed successfully',
                                }];
                    }
                });
            });
        };
        JobsController_1.prototype.cleanQueue = function (type, cleanJobsDto) {
            return __awaiter(this, void 0, void 0, function () {
                var removed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jobsService.cleanOldJobs(type, cleanJobsDto.grace, cleanJobsDto.status)];
                        case 1:
                            removed = _a.sent();
                            return [2 /*return*/, {
                                    queue: type,
                                    removed: removed.length,
                                    message: "Removed ".concat(removed.length, " jobs from queue"),
                                }];
                    }
                });
            });
        };
        JobsController_1.prototype.checkHealth = function () {
            return __awaiter(this, void 0, void 0, function () {
                var metrics, queues, healthy, totalJobs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jobsService.getQueueMetrics()];
                        case 1:
                            metrics = _a.sent();
                            queues = Array.isArray(metrics) ? metrics : [metrics];
                            healthy = queues.every(function (q) { return !q.paused && q.failedRate < 50; });
                            totalJobs = queues.reduce(function (sum, q) {
                                return sum + q.waiting + q.active + q.completed + q.failed + q.delayed;
                            }, 0);
                            return [2 /*return*/, {
                                    status: healthy ? 'healthy' : 'degraded',
                                    queues: queues.length,
                                    totalJobs: totalJobs,
                                    metrics: queues.map(function (q) { return ({
                                        name: q.name,
                                        active: q.active,
                                        failed: q.failed,
                                        failedRate: q.failedRate,
                                        paused: q.paused,
                                    }); }),
                                }];
                    }
                });
            });
        };
        return JobsController_1;
    }());
    __setFunctionName(_classThis, "JobsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createJob_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)('admin', 'manager'), (0, swagger_1.ApiOperation)({
                summary: 'Create a new job',
                description: 'Create a new background job for asynchronous processing (file analysis, quote calculation, etc.)'
            }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.CREATED,
                description: 'Job created successfully',
                schema: {
                    properties: {
                        jobId: { type: 'string', example: 'job_123456' },
                        type: { type: 'string', example: 'file-analysis' },
                        status: { type: 'string', example: 'waiting' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.BAD_REQUEST,
                description: 'Invalid job data'
            })];
        _scheduleJob_decorators = [(0, common_1.Post)('schedule'), (0, roles_decorator_1.Roles)('admin', 'manager'), (0, swagger_1.ApiOperation)({ summary: 'Schedule a job for future execution' }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.CREATED,
                description: 'Job scheduled successfully'
            })];
        _createRecurringJob_decorators = [(0, common_1.Post)('recurring'), (0, roles_decorator_1.Roles)('admin'), (0, swagger_1.ApiOperation)({ summary: 'Create a recurring job' }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.CREATED,
                description: 'Recurring job created successfully'
            })];
        _getJobStatus_decorators = [(0, common_1.Get)(':jobId'), (0, swagger_1.ApiOperation)({
                summary: 'Get job status by ID',
                description: 'Retrieve detailed status and progress information for a specific job'
            }), (0, swagger_1.ApiParam)({
                name: 'jobId',
                description: 'Unique job identifier',
                example: 'job_123456'
            }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.OK,
                description: 'Job status retrieved',
                type: job_dto_1.JobStatusDto,
            }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.NOT_FOUND,
                description: 'Job not found'
            })];
        _getJobs_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get jobs by tenant' }), (0, swagger_1.ApiQuery)({ name: 'type', enum: job_interface_1.JobType, required: false }), (0, swagger_1.ApiQuery)({ name: 'status', enum: job_interface_1.JobStatus, required: false }), (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 100 }), (0, swagger_1.ApiQuery)({ name: 'offset', type: Number, required: false, example: 0 }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.OK,
                description: 'Jobs retrieved',
                type: [job_dto_1.JobStatusDto],
            })];
        _retryJob_decorators = [(0, common_1.Post)(':jobId/retry'), (0, roles_decorator_1.Roles)('admin', 'manager'), (0, swagger_1.ApiOperation)({ summary: 'Retry a failed job' }), (0, swagger_1.ApiParam)({ name: 'jobId', description: 'Job ID' }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.OK,
                description: 'Job retried successfully'
            })];
        _cancelJob_decorators = [(0, common_1.Delete)(':jobId'), (0, roles_decorator_1.Roles)('admin', 'manager'), (0, swagger_1.ApiOperation)({ summary: 'Cancel a job' }), (0, swagger_1.ApiParam)({ name: 'jobId', description: 'Job ID' }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.OK,
                description: 'Job cancelled successfully'
            })];
        _moveToDeadLetter_decorators = [(0, common_1.Post)(':jobId/dead-letter'), (0, roles_decorator_1.Roles)('admin'), (0, swagger_1.ApiOperation)({ summary: 'Move job to dead letter queue' }), (0, swagger_1.ApiParam)({ name: 'jobId', description: 'Job ID' }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.OK,
                description: 'Job moved to dead letter queue'
            })];
        _getQueueMetrics_decorators = [(0, common_1.Get)('queues/metrics'), (0, roles_decorator_1.Roles)('admin', 'manager'), (0, swagger_1.ApiOperation)({
                summary: 'Get queue metrics',
                description: 'Retrieve real-time metrics and statistics for job queues'
            }), (0, swagger_1.ApiQuery)({
                name: 'type',
                enum: job_interface_1.JobType,
                required: false,
                description: 'Filter metrics by specific queue type'
            }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.OK,
                description: 'Queue metrics retrieved',
                type: [job_dto_1.QueueStatusDto],
            })];
        _pauseQueue_decorators = [(0, common_1.Post)('queues/:type/pause'), (0, roles_decorator_1.Roles)('admin'), (0, swagger_1.ApiOperation)({ summary: 'Pause a queue' }), (0, swagger_1.ApiParam)({ name: 'type', enum: job_interface_1.JobType }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.OK,
                description: 'Queue paused successfully'
            })];
        _resumeQueue_decorators = [(0, common_1.Post)('queues/:type/resume'), (0, roles_decorator_1.Roles)('admin'), (0, swagger_1.ApiOperation)({ summary: 'Resume a queue' }), (0, swagger_1.ApiParam)({ name: 'type', enum: job_interface_1.JobType }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.OK,
                description: 'Queue resumed successfully'
            })];
        _cleanQueue_decorators = [(0, common_1.Post)('queues/:type/clean'), (0, roles_decorator_1.Roles)('admin'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Clean old jobs from queue' }), (0, swagger_1.ApiParam)({ name: 'type', enum: job_interface_1.JobType }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.OK,
                description: 'Queue cleaned successfully'
            })];
        _checkHealth_decorators = [(0, common_1.Get)('health/check'), (0, swagger_1.ApiOperation)({
                summary: 'Check job system health',
                description: 'Get overall health status of the job processing system'
            }), (0, swagger_1.ApiResponse)({
                status: common_1.HttpStatus.OK,
                description: 'Job system health status',
                schema: {
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['healthy', 'degraded'],
                            example: 'healthy'
                        },
                        queues: { type: 'number', example: 4 },
                        totalJobs: { type: 'number', example: 1234 },
                        metrics: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'file-analysis' },
                                    active: { type: 'number', example: 5 },
                                    failed: { type: 'number', example: 2 },
                                    failedRate: { type: 'number', example: 2.5 },
                                    paused: { type: 'boolean', example: false }
                                }
                            }
                        }
                    }
                }
            })];
        __esDecorate(_classThis, null, _createJob_decorators, { kind: "method", name: "createJob", static: false, private: false, access: { has: function (obj) { return "createJob" in obj; }, get: function (obj) { return obj.createJob; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _scheduleJob_decorators, { kind: "method", name: "scheduleJob", static: false, private: false, access: { has: function (obj) { return "scheduleJob" in obj; }, get: function (obj) { return obj.scheduleJob; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createRecurringJob_decorators, { kind: "method", name: "createRecurringJob", static: false, private: false, access: { has: function (obj) { return "createRecurringJob" in obj; }, get: function (obj) { return obj.createRecurringJob; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getJobStatus_decorators, { kind: "method", name: "getJobStatus", static: false, private: false, access: { has: function (obj) { return "getJobStatus" in obj; }, get: function (obj) { return obj.getJobStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getJobs_decorators, { kind: "method", name: "getJobs", static: false, private: false, access: { has: function (obj) { return "getJobs" in obj; }, get: function (obj) { return obj.getJobs; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _retryJob_decorators, { kind: "method", name: "retryJob", static: false, private: false, access: { has: function (obj) { return "retryJob" in obj; }, get: function (obj) { return obj.retryJob; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancelJob_decorators, { kind: "method", name: "cancelJob", static: false, private: false, access: { has: function (obj) { return "cancelJob" in obj; }, get: function (obj) { return obj.cancelJob; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _moveToDeadLetter_decorators, { kind: "method", name: "moveToDeadLetter", static: false, private: false, access: { has: function (obj) { return "moveToDeadLetter" in obj; }, get: function (obj) { return obj.moveToDeadLetter; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getQueueMetrics_decorators, { kind: "method", name: "getQueueMetrics", static: false, private: false, access: { has: function (obj) { return "getQueueMetrics" in obj; }, get: function (obj) { return obj.getQueueMetrics; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _pauseQueue_decorators, { kind: "method", name: "pauseQueue", static: false, private: false, access: { has: function (obj) { return "pauseQueue" in obj; }, get: function (obj) { return obj.pauseQueue; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resumeQueue_decorators, { kind: "method", name: "resumeQueue", static: false, private: false, access: { has: function (obj) { return "resumeQueue" in obj; }, get: function (obj) { return obj.resumeQueue; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cleanQueue_decorators, { kind: "method", name: "cleanQueue", static: false, private: false, access: { has: function (obj) { return "cleanQueue" in obj; }, get: function (obj) { return obj.cleanQueue; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _checkHealth_decorators, { kind: "method", name: "checkHealth", static: false, private: false, access: { has: function (obj) { return "checkHealth" in obj; }, get: function (obj) { return obj.checkHealth; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        JobsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return JobsController = _classThis;
}();
exports.JobsController = JobsController;
