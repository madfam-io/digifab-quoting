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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
var common_1 = require("@nestjs/common");
var job_interface_1 = require("./interfaces/job.interface");
var error_handling_1 = require("@/common/utils/error-handling");
var JobsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var JobsService = _classThis = /** @class */ (function () {
        function JobsService_1(fileAnalysisQueue, quoteCalculationQueue, emailNotificationQueue, reportGenerationQueue, deadLetterQueue, logger, redisService, tenantContext) {
            this.deadLetterQueue = deadLetterQueue;
            this.logger = logger;
            this.redisService = redisService;
            this.tenantContext = tenantContext;
            this.queues = new Map();
            this.DEFAULT_JOB_OPTIONS = {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: 100,
                removeOnFail: 1000,
            };
            // Initialize queue map
            this.queues.set(job_interface_1.JobType.FILE_ANALYSIS, fileAnalysisQueue);
            this.queues.set(job_interface_1.JobType.QUOTE_CALCULATION, quoteCalculationQueue);
            this.queues.set(job_interface_1.JobType.EMAIL_NOTIFICATION, emailNotificationQueue);
            this.queues.set(job_interface_1.JobType.REPORT_GENERATION, reportGenerationQueue);
        }
        JobsService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _i, _a, _b, type, queue;
                return __generator(this, function (_c) {
                    // Set up queue event listeners
                    for (_i = 0, _a = this.queues; _i < _a.length; _i++) {
                        _b = _a[_i], type = _b[0], queue = _b[1];
                        this.setupQueueListeners(type, queue);
                    }
                    // Set up dead letter queue processing
                    this.setupDeadLetterQueue();
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Add a job to the appropriate queue
         */
        JobsService_1.prototype.addJob = function (type, data, options) {
            return __awaiter(this, void 0, void 0, function () {
                var queue, tenantId, jobData, jobOptions, job;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            queue = this.queues.get(type);
                            if (!queue) {
                                throw new Error("Queue for job type ".concat(type, " not found"));
                            }
                            tenantId = data.tenantId || this.tenantContext.getTenantId();
                            if (!tenantId) {
                                throw new Error('Tenant ID is required for job processing');
                            }
                            jobData = __assign(__assign({}, data), { tenantId: tenantId, correlationId: data.correlationId || this.generateCorrelationId() });
                            jobOptions = __assign(__assign({}, this.DEFAULT_JOB_OPTIONS), options);
                            return [4 /*yield*/, queue.add(type, jobData, jobOptions)];
                        case 1:
                            job = _a.sent();
                            this.logger.log("Job ".concat(job.id, " of type ").concat(type, " added to queue"), {
                                jobId: job.id,
                                type: type,
                                tenantId: tenantId,
                                correlationId: jobData.correlationId,
                            });
                            // Track job in Redis for quick lookups
                            return [4 /*yield*/, this.trackJob(job.id, type, tenantId)];
                        case 2:
                            // Track job in Redis for quick lookups
                            _a.sent();
                            return [2 /*return*/, job];
                    }
                });
            });
        };
        /**
         * Schedule a job for future execution
         */
        JobsService_1.prototype.scheduleJob = function (type, data, delay, options) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.addJob(type, data, __assign(__assign({}, options), { delay: delay }))];
                });
            });
        };
        /**
         * Add a recurring job (cron job)
         */
        JobsService_1.prototype.addRecurringJob = function (type, data, cronExpression, options) {
            return __awaiter(this, void 0, void 0, function () {
                var queue, jobName;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            queue = this.queues.get(type);
                            if (!queue) {
                                throw new Error("Queue for job type ".concat(type, " not found"));
                            }
                            jobName = "".concat(type, "-recurring-").concat(data.tenantId);
                            return [4 /*yield*/, queue.add(jobName, data, __assign(__assign(__assign({}, this.DEFAULT_JOB_OPTIONS), options), { repeat: {
                                        cron: cronExpression,
                                    } }))];
                        case 1:
                            _a.sent();
                            this.logger.log("Recurring job ".concat(jobName, " scheduled with cron: ").concat(cronExpression));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get job by ID
         */
        JobsService_1.prototype.getJob = function (jobId) {
            return __awaiter(this, void 0, void 0, function () {
                var jobInfo, _i, _a, queue_1, job, queue;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getJobInfo(jobId)];
                        case 1:
                            jobInfo = _b.sent();
                            if (!!jobInfo) return [3 /*break*/, 6];
                            _i = 0, _a = this.queues.values();
                            _b.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            queue_1 = _a[_i];
                            return [4 /*yield*/, queue_1.getJob(jobId)];
                        case 3:
                            job = _b.sent();
                            if (job)
                                return [2 /*return*/, job];
                            _b.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/, null];
                        case 6:
                            queue = this.queues.get(jobInfo.type);
                            return [2 /*return*/, queue ? queue.getJob(jobId) : null];
                    }
                });
            });
        };
        /**
         * Get job status and progress
         */
        JobsService_1.prototype.getJobStatus = function (jobId) {
            return __awaiter(this, void 0, void 0, function () {
                var job, state, progress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getJob(jobId)];
                        case 1:
                            job = _a.sent();
                            if (!job)
                                return [2 /*return*/, null];
                            return [4 /*yield*/, job.getState()];
                        case 2:
                            state = _a.sent();
                            progress = job.progress();
                            return [2 /*return*/, {
                                    jobId: job.id,
                                    type: job.name,
                                    status: this.mapBullStatus(state),
                                    createdAt: new Date(job.timestamp),
                                    startedAt: job.processedOn ? new Date(job.processedOn) : undefined,
                                    completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
                                    progress: typeof progress === 'number' ? progress : 0,
                                    attempts: job.attemptsMade,
                                    error: job.failedReason,
                                    result: job.returnvalue,
                                    duration: job.finishedOn && job.processedOn
                                        ? job.finishedOn - job.processedOn
                                        : undefined,
                                }];
                    }
                });
            });
        };
        /**
         * Update job progress
         */
        JobsService_1.prototype.updateJobProgress = function (jobId, progress, message) {
            return __awaiter(this, void 0, void 0, function () {
                var job;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getJob(jobId)];
                        case 1:
                            job = _a.sent();
                            if (!job) return [3 /*break*/, 4];
                            return [4 /*yield*/, job.progress(progress)];
                        case 2:
                            _a.sent();
                            if (!message) return [3 /*break*/, 4];
                            return [4 /*yield*/, job.log(message)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Cancel a job
         */
        JobsService_1.prototype.cancelJob = function (jobId) {
            return __awaiter(this, void 0, void 0, function () {
                var job, state;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getJob(jobId)];
                        case 1:
                            job = _a.sent();
                            if (!job)
                                return [2 /*return*/, false];
                            return [4 /*yield*/, job.getState()];
                        case 2:
                            state = _a.sent();
                            if (!(state === 'active')) return [3 /*break*/, 4];
                            // Can't cancel active jobs, but we can mark them for cancellation
                            return [4 /*yield*/, job.update({ cancelled: true })];
                        case 3:
                            // Can't cancel active jobs, but we can mark them for cancellation
                            _a.sent();
                            this.logger.warn("Job ".concat(jobId, " marked for cancellation"));
                            return [2 /*return*/, true];
                        case 4: return [4 /*yield*/, job.remove()];
                        case 5:
                            _a.sent();
                            this.logger.log("Job ".concat(jobId, " cancelled and removed"));
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        /**
         * Retry a failed job
         */
        JobsService_1.prototype.retryJob = function (jobId) {
            return __awaiter(this, void 0, void 0, function () {
                var job, state;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getJob(jobId)];
                        case 1:
                            job = _a.sent();
                            if (!job)
                                return [2 /*return*/, null];
                            return [4 /*yield*/, job.getState()];
                        case 2:
                            state = _a.sent();
                            if (state !== 'failed') {
                                throw new Error("Job ".concat(jobId, " is not in failed state"));
                            }
                            return [4 /*yield*/, job.retry()];
                        case 3:
                            _a.sent();
                            this.logger.log("Job ".concat(jobId, " retried"));
                            return [2 /*return*/, job];
                    }
                });
            });
        };
        /**
         * Move failed job to dead letter queue
         */
        JobsService_1.prototype.moveToDeadLetter = function (jobId, reason) {
            return __awaiter(this, void 0, void 0, function () {
                var job;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getJob(jobId)];
                        case 1:
                            job = _a.sent();
                            if (!job)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.deadLetterQueue.add('dead-letter', {
                                    originalJob: {
                                        id: job.id,
                                        name: job.name,
                                        data: job.data,
                                        opts: job.opts,
                                        failedReason: job.failedReason,
                                        stacktrace: job.stacktrace,
                                        attemptsMade: job.attemptsMade,
                                    },
                                    reason: reason,
                                    movedAt: new Date(),
                                })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, job.remove()];
                        case 3:
                            _a.sent();
                            this.logger.warn("Job ".concat(jobId, " moved to dead letter queue: ").concat(reason));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get queue metrics
         */
        JobsService_1.prototype.getQueueMetrics = function (type) {
            return __awaiter(this, void 0, void 0, function () {
                var queue, metrics, _i, _a, _b, type_1, queue, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            if (type) {
                                queue = this.queues.get(type);
                                if (!queue)
                                    throw new Error("Queue ".concat(type, " not found"));
                                return [2 /*return*/, this.getMetricsForQueue(type, queue)];
                            }
                            metrics = [];
                            _i = 0, _a = this.queues;
                            _e.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                            _b = _a[_i], type_1 = _b[0], queue = _b[1];
                            _d = (_c = metrics).push;
                            return [4 /*yield*/, this.getMetricsForQueue(type_1, queue)];
                        case 2:
                            _d.apply(_c, [_e.sent()]);
                            _e.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, metrics];
                    }
                });
            });
        };
        /**
         * Clean old jobs from queues
         */
        JobsService_1.prototype.cleanOldJobs = function (type, grace, status) {
            return __awaiter(this, void 0, void 0, function () {
                var queue, statuses, removed, _i, statuses_1, s, jobs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            queue = this.queues.get(type);
                            if (!queue)
                                throw new Error("Queue ".concat(type, " not found"));
                            statuses = status || ['completed', 'failed'];
                            removed = [];
                            _i = 0, statuses_1 = statuses;
                            _a.label = 1;
                        case 1:
                            if (!(_i < statuses_1.length)) return [3 /*break*/, 4];
                            s = statuses_1[_i];
                            return [4 /*yield*/, queue.clean(grace, s)];
                        case 2:
                            jobs = _a.sent();
                            removed.push.apply(removed, jobs.map(function (j) { return j.id; }));
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            this.logger.log("Cleaned ".concat(removed.length, " jobs from ").concat(type, " queue"));
                            return [2 /*return*/, removed];
                    }
                });
            });
        };
        /**
         * Pause/resume queue processing
         */
        JobsService_1.prototype.pauseQueue = function (type) {
            return __awaiter(this, void 0, void 0, function () {
                var queue;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            queue = this.queues.get(type);
                            if (!queue)
                                throw new Error("Queue ".concat(type, " not found"));
                            return [4 /*yield*/, queue.pause()];
                        case 1:
                            _a.sent();
                            this.logger.log("Queue ".concat(type, " paused"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        JobsService_1.prototype.resumeQueue = function (type) {
            return __awaiter(this, void 0, void 0, function () {
                var queue;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            queue = this.queues.get(type);
                            if (!queue)
                                throw new Error("Queue ".concat(type, " not found"));
                            return [4 /*yield*/, queue.resume()];
                        case 1:
                            _a.sent();
                            this.logger.log("Queue ".concat(type, " resumed"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get jobs by tenant
         */
        JobsService_1.prototype.getJobsByTenant = function (tenantId, options) {
            return __awaiter(this, void 0, void 0, function () {
                var jobs, queues, _i, queues_1, queue, states, _a, states_1, state, queueJobs, _b, queueJobs_1, job, metrics, start, limit;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            jobs = [];
                            queues = (options === null || options === void 0 ? void 0 : options.type)
                                ? [this.queues.get(options.type)].filter(Boolean)
                                : Array.from(this.queues.values());
                            _i = 0, queues_1 = queues;
                            _c.label = 1;
                        case 1:
                            if (!(_i < queues_1.length)) return [3 /*break*/, 9];
                            queue = queues_1[_i];
                            if (!queue)
                                return [3 /*break*/, 8];
                            states = (options === null || options === void 0 ? void 0 : options.status)
                                ? [this.mapToBullStatus(options.status)]
                                : ['waiting', 'active', 'completed', 'failed', 'delayed', 'paused'];
                            _a = 0, states_1 = states;
                            _c.label = 2;
                        case 2:
                            if (!(_a < states_1.length)) return [3 /*break*/, 8];
                            state = states_1[_a];
                            return [4 /*yield*/, queue.getJobs([state], 0, -1)];
                        case 3:
                            queueJobs = _c.sent();
                            _b = 0, queueJobs_1 = queueJobs;
                            _c.label = 4;
                        case 4:
                            if (!(_b < queueJobs_1.length)) return [3 /*break*/, 7];
                            job = queueJobs_1[_b];
                            if (!(job.data.tenantId === tenantId)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.getJobStatus(job.id)];
                        case 5:
                            metrics = _c.sent();
                            if (metrics)
                                jobs.push(metrics);
                            _c.label = 6;
                        case 6:
                            _b++;
                            return [3 /*break*/, 4];
                        case 7:
                            _a++;
                            return [3 /*break*/, 2];
                        case 8:
                            _i++;
                            return [3 /*break*/, 1];
                        case 9:
                            start = (options === null || options === void 0 ? void 0 : options.offset) || 0;
                            limit = (options === null || options === void 0 ? void 0 : options.limit) || 100;
                            return [2 /*return*/, jobs.slice(start, start + limit)];
                    }
                });
            });
        };
        JobsService_1.prototype.setupQueueListeners = function (type, queue) {
            var _this = this;
            queue.on('completed', function (job, _result) {
                _this.logger.log("Job ".concat(job.id, " of type ").concat(type, " completed"), {
                    jobId: job.id,
                    type: type,
                    duration: job.finishedOn && job.processedOn
                        ? job.finishedOn - job.processedOn
                        : undefined,
                });
            });
            queue.on('failed', function (job, err) {
                _this.logger.error("Job ".concat(job.id, " of type ").concat(type, " failed"), (0, error_handling_1.toError)(err));
                // Move to dead letter queue after max attempts
                if (job.attemptsMade >= (job.opts.attempts || _this.DEFAULT_JOB_OPTIONS.attempts)) {
                    _this.moveToDeadLetter(job.id, 'Max attempts reached');
                }
            });
            queue.on('stalled', function (job) {
                _this.logger.warn("Job ".concat(job.id, " of type ").concat(type, " stalled"), {
                    jobId: job.id,
                    type: type,
                });
            });
            queue.on('error', function (error) {
                _this.logger.error("Queue ".concat(type, " error"), (0, error_handling_1.toError)(error));
            });
        };
        JobsService_1.prototype.setupDeadLetterQueue = function () {
            var _this = this;
            // Process dead letter queue periodically
            setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                var jobs, _i, jobs_1, job;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.deadLetterQueue.getJobs(['waiting'], 0, 10)];
                        case 1:
                            jobs = _a.sent();
                            for (_i = 0, jobs_1 = jobs; _i < jobs_1.length; _i++) {
                                job = jobs_1[_i];
                                this.logger.warn('Dead letter job found', {
                                    originalJobId: job.data.originalJob.id,
                                    reason: job.data.reason,
                                });
                                // You can implement custom logic here to handle dead letter jobs
                                // For example, send alerts, store in database, etc.
                            }
                            return [2 /*return*/];
                    }
                });
            }); }, 60000); // Check every minute
        };
        JobsService_1.prototype.trackJob = function (jobId, type, tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var key;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = this.redisService.generateKey({
                                prefix: 'job-tracking',
                                identifier: jobId,
                            });
                            return [4 /*yield*/, this.redisService.set(key, { type: type, tenantId: tenantId }, 3600 * 24 * 7)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        JobsService_1.prototype.getJobInfo = function (jobId) {
            return __awaiter(this, void 0, void 0, function () {
                var key;
                return __generator(this, function (_a) {
                    key = this.redisService.generateKey({
                        prefix: 'job-tracking',
                        identifier: jobId,
                    });
                    return [2 /*return*/, this.redisService.get(key)];
                });
            });
        };
        JobsService_1.prototype.getMetricsForQueue = function (type, queue) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, waiting, active, completed, failed, delayed, paused, total, completedRate, failedRate, recentJobs, totalTime, count, _i, recentJobs_1, job, avgProcessingTime;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                queue.getWaitingCount(),
                                queue.getActiveCount(),
                                queue.getCompletedCount(),
                                queue.getFailedCount(),
                                queue.getDelayedCount(),
                                queue.isPaused(),
                            ])];
                        case 1:
                            _a = _b.sent(), waiting = _a[0], active = _a[1], completed = _a[2], failed = _a[3], delayed = _a[4], paused = _a[5];
                            total = completed + failed;
                            completedRate = total > 0 ? (completed / total) * 100 : 0;
                            failedRate = total > 0 ? (failed / total) * 100 : 0;
                            return [4 /*yield*/, queue.getJobs(['completed'], 0, 100)];
                        case 2:
                            recentJobs = _b.sent();
                            totalTime = 0;
                            count = 0;
                            for (_i = 0, recentJobs_1 = recentJobs; _i < recentJobs_1.length; _i++) {
                                job = recentJobs_1[_i];
                                if (job.finishedOn && job.processedOn) {
                                    totalTime += job.finishedOn - job.processedOn;
                                    count++;
                                }
                            }
                            avgProcessingTime = count > 0 ? totalTime / count : 0;
                            return [2 /*return*/, {
                                    name: type,
                                    waiting: waiting,
                                    active: active,
                                    completed: completed,
                                    failed: failed,
                                    delayed: delayed,
                                    paused: paused,
                                    completedRate: completedRate,
                                    failedRate: failedRate,
                                    avgProcessingTime: avgProcessingTime,
                                }];
                    }
                });
            });
        };
        JobsService_1.prototype.mapBullStatus = function (status) {
            switch (status) {
                case 'waiting':
                    return job_interface_1.JobStatus.PENDING;
                case 'active':
                    return job_interface_1.JobStatus.PROCESSING;
                case 'completed':
                    return job_interface_1.JobStatus.COMPLETED;
                case 'failed':
                    return job_interface_1.JobStatus.FAILED;
                case 'delayed':
                    return job_interface_1.JobStatus.DELAYED;
                case 'paused':
                    return job_interface_1.JobStatus.PENDING;
                case 'stuck':
                    return job_interface_1.JobStatus.STUCK;
                default:
                    return job_interface_1.JobStatus.PENDING;
            }
        };
        JobsService_1.prototype.mapToBullStatus = function (status) {
            switch (status) {
                case job_interface_1.JobStatus.PENDING:
                    return 'waiting';
                case job_interface_1.JobStatus.PROCESSING:
                    return 'active';
                case job_interface_1.JobStatus.COMPLETED:
                    return 'completed';
                case job_interface_1.JobStatus.FAILED:
                    return 'failed';
                case job_interface_1.JobStatus.DELAYED:
                    return 'delayed';
                case job_interface_1.JobStatus.STALLED:
                    return 'failed';
                case job_interface_1.JobStatus.STUCK:
                    return 'waiting'; // Bull doesn't have 'stuck' status
                default:
                    return 'waiting';
            }
        };
        JobsService_1.prototype.generateCorrelationId = function () {
            return "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
        };
        return JobsService_1;
    }());
    __setFunctionName(_classThis, "JobsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        JobsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return JobsService = _classThis;
}();
exports.JobsService = JobsService;
