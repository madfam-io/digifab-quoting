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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerationJobDto = exports.EmailNotificationJobDto = exports.QuoteCalculationJobDto = exports.FileAnalysisJobDto = exports.CleanJobsDto = exports.QueueStatusDto = exports.JobStatusDto = exports.JobQueryDto = exports.RecurringJobDto = exports.ScheduleJobDto = exports.CreateJobDto = exports.JobOptionsDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var job_interface_1 = require("../interfaces/job.interface");
var JobOptionsDto = function () {
    var _a;
    var _delay_decorators;
    var _delay_initializers = [];
    var _delay_extraInitializers = [];
    var _attempts_decorators;
    var _attempts_initializers = [];
    var _attempts_extraInitializers = [];
    var _backoff_decorators;
    var _backoff_initializers = [];
    var _backoff_extraInitializers = [];
    var _removeOnComplete_decorators;
    var _removeOnComplete_initializers = [];
    var _removeOnComplete_extraInitializers = [];
    var _removeOnFail_decorators;
    var _removeOnFail_initializers = [];
    var _removeOnFail_extraInitializers = [];
    var _priority_decorators;
    var _priority_initializers = [];
    var _priority_extraInitializers = [];
    var _timeout_decorators;
    var _timeout_initializers = [];
    var _timeout_extraInitializers = [];
    return _a = /** @class */ (function () {
            function JobOptionsDto() {
                this.delay = __runInitializers(this, _delay_initializers, void 0);
                this.attempts = (__runInitializers(this, _delay_extraInitializers), __runInitializers(this, _attempts_initializers, void 0));
                this.backoff = (__runInitializers(this, _attempts_extraInitializers), __runInitializers(this, _backoff_initializers, void 0));
                this.removeOnComplete = (__runInitializers(this, _backoff_extraInitializers), __runInitializers(this, _removeOnComplete_initializers, void 0));
                this.removeOnFail = (__runInitializers(this, _removeOnComplete_extraInitializers), __runInitializers(this, _removeOnFail_initializers, void 0));
                this.priority = (__runInitializers(this, _removeOnFail_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
                this.timeout = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _timeout_initializers, void 0));
                __runInitializers(this, _timeout_extraInitializers);
            }
            return JobOptionsDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _delay_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Delay in milliseconds before processing' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _attempts_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Number of attempts before failing', default: 3 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(10)];
            _backoff_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Backoff configuration',
                    example: { type: 'exponential', delay: 5000 }
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)()];
            _removeOnComplete_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Remove job after completion' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _removeOnFail_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Remove job after failure' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _priority_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Job priority (higher = more priority)' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(1000000)];
            _timeout_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Job timeout in milliseconds' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1000), (0, class_validator_1.Max)(3600000)];
            __esDecorate(null, null, _delay_decorators, { kind: "field", name: "delay", static: false, private: false, access: { has: function (obj) { return "delay" in obj; }, get: function (obj) { return obj.delay; }, set: function (obj, value) { obj.delay = value; } }, metadata: _metadata }, _delay_initializers, _delay_extraInitializers);
            __esDecorate(null, null, _attempts_decorators, { kind: "field", name: "attempts", static: false, private: false, access: { has: function (obj) { return "attempts" in obj; }, get: function (obj) { return obj.attempts; }, set: function (obj, value) { obj.attempts = value; } }, metadata: _metadata }, _attempts_initializers, _attempts_extraInitializers);
            __esDecorate(null, null, _backoff_decorators, { kind: "field", name: "backoff", static: false, private: false, access: { has: function (obj) { return "backoff" in obj; }, get: function (obj) { return obj.backoff; }, set: function (obj, value) { obj.backoff = value; } }, metadata: _metadata }, _backoff_initializers, _backoff_extraInitializers);
            __esDecorate(null, null, _removeOnComplete_decorators, { kind: "field", name: "removeOnComplete", static: false, private: false, access: { has: function (obj) { return "removeOnComplete" in obj; }, get: function (obj) { return obj.removeOnComplete; }, set: function (obj, value) { obj.removeOnComplete = value; } }, metadata: _metadata }, _removeOnComplete_initializers, _removeOnComplete_extraInitializers);
            __esDecorate(null, null, _removeOnFail_decorators, { kind: "field", name: "removeOnFail", static: false, private: false, access: { has: function (obj) { return "removeOnFail" in obj; }, get: function (obj) { return obj.removeOnFail; }, set: function (obj, value) { obj.removeOnFail = value; } }, metadata: _metadata }, _removeOnFail_initializers, _removeOnFail_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: function (obj) { return "priority" in obj; }, get: function (obj) { return obj.priority; }, set: function (obj, value) { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            __esDecorate(null, null, _timeout_decorators, { kind: "field", name: "timeout", static: false, private: false, access: { has: function (obj) { return "timeout" in obj; }, get: function (obj) { return obj.timeout; }, set: function (obj, value) { obj.timeout = value; } }, metadata: _metadata }, _timeout_initializers, _timeout_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.JobOptionsDto = JobOptionsDto;
var CreateJobDto = function () {
    var _a;
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _data_decorators;
    var _data_initializers = [];
    var _data_extraInitializers = [];
    var _options_decorators;
    var _options_initializers = [];
    var _options_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateJobDto() {
                this.type = __runInitializers(this, _type_initializers, void 0);
                this.data = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _data_initializers, void 0));
                this.options = (__runInitializers(this, _data_extraInitializers), __runInitializers(this, _options_initializers, void 0));
                __runInitializers(this, _options_extraInitializers);
            }
            return CreateJobDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, swagger_1.ApiProperty)({ enum: job_interface_1.JobType, description: 'Type of job to create' }), (0, class_validator_1.IsEnum)(job_interface_1.JobType)];
            _data_decorators = [(0, swagger_1.ApiProperty)({ description: 'Job data payload' }), (0, class_validator_1.IsObject)()];
            _options_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Job processing options' }), (0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(function () { return JobOptionsDto; })];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _data_decorators, { kind: "field", name: "data", static: false, private: false, access: { has: function (obj) { return "data" in obj; }, get: function (obj) { return obj.data; }, set: function (obj, value) { obj.data = value; } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
            __esDecorate(null, null, _options_decorators, { kind: "field", name: "options", static: false, private: false, access: { has: function (obj) { return "options" in obj; }, get: function (obj) { return obj.options; }, set: function (obj, value) { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateJobDto = CreateJobDto;
var ScheduleJobDto = function () {
    var _a;
    var _classSuper = CreateJobDto;
    var _delay_decorators;
    var _delay_initializers = [];
    var _delay_extraInitializers = [];
    return _a = /** @class */ (function (_super) {
            __extends(ScheduleJobDto, _super);
            function ScheduleJobDto() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.delay = __runInitializers(_this, _delay_initializers, void 0);
                __runInitializers(_this, _delay_extraInitializers);
                return _this;
            }
            return ScheduleJobDto;
        }(_classSuper)),
        (function () {
            var _b;
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _delay_decorators = [(0, swagger_1.ApiProperty)({ description: 'Delay in milliseconds before processing' }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1000), (0, class_validator_1.Max)(86400000)];
            __esDecorate(null, null, _delay_decorators, { kind: "field", name: "delay", static: false, private: false, access: { has: function (obj) { return "delay" in obj; }, get: function (obj) { return obj.delay; }, set: function (obj, value) { obj.delay = value; } }, metadata: _metadata }, _delay_initializers, _delay_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ScheduleJobDto = ScheduleJobDto;
var RecurringJobDto = function () {
    var _a;
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _data_decorators;
    var _data_initializers = [];
    var _data_extraInitializers = [];
    var _cronExpression_decorators;
    var _cronExpression_initializers = [];
    var _cronExpression_extraInitializers = [];
    var _options_decorators;
    var _options_initializers = [];
    var _options_extraInitializers = [];
    return _a = /** @class */ (function () {
            function RecurringJobDto() {
                this.type = __runInitializers(this, _type_initializers, void 0);
                this.data = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _data_initializers, void 0));
                this.cronExpression = (__runInitializers(this, _data_extraInitializers), __runInitializers(this, _cronExpression_initializers, void 0));
                this.options = (__runInitializers(this, _cronExpression_extraInitializers), __runInitializers(this, _options_initializers, void 0));
                __runInitializers(this, _options_extraInitializers);
            }
            return RecurringJobDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, swagger_1.ApiProperty)({ enum: job_interface_1.JobType, description: 'Type of job to create' }), (0, class_validator_1.IsEnum)(job_interface_1.JobType)];
            _data_decorators = [(0, swagger_1.ApiProperty)({ description: 'Job data payload' }), (0, class_validator_1.IsObject)()];
            _cronExpression_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Cron expression for scheduling',
                    example: '0 0 * * *' // Daily at midnight
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.Matches)(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/)];
            _options_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Job processing options' }), (0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(function () { return JobOptionsDto; })];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _data_decorators, { kind: "field", name: "data", static: false, private: false, access: { has: function (obj) { return "data" in obj; }, get: function (obj) { return obj.data; }, set: function (obj, value) { obj.data = value; } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
            __esDecorate(null, null, _cronExpression_decorators, { kind: "field", name: "cronExpression", static: false, private: false, access: { has: function (obj) { return "cronExpression" in obj; }, get: function (obj) { return obj.cronExpression; }, set: function (obj, value) { obj.cronExpression = value; } }, metadata: _metadata }, _cronExpression_initializers, _cronExpression_extraInitializers);
            __esDecorate(null, null, _options_decorators, { kind: "field", name: "options", static: false, private: false, access: { has: function (obj) { return "options" in obj; }, get: function (obj) { return obj.options; }, set: function (obj, value) { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.RecurringJobDto = RecurringJobDto;
var JobQueryDto = function () {
    var _a;
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _limit_decorators;
    var _limit_initializers = [];
    var _limit_extraInitializers = [];
    var _offset_decorators;
    var _offset_initializers = [];
    var _offset_extraInitializers = [];
    return _a = /** @class */ (function () {
            function JobQueryDto() {
                this.type = __runInitializers(this, _type_initializers, void 0);
                this.status = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.limit = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _limit_initializers, 100));
                this.offset = (__runInitializers(this, _limit_extraInitializers), __runInitializers(this, _offset_initializers, 0));
                __runInitializers(this, _offset_extraInitializers);
            }
            return JobQueryDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, swagger_1.ApiPropertyOptional)({ enum: job_interface_1.JobType, description: 'Filter by job type' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(job_interface_1.JobType)];
            _status_decorators = [(0, swagger_1.ApiPropertyOptional)({ enum: job_interface_1.JobStatus, description: 'Filter by job status' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(job_interface_1.JobStatus)];
            _limit_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Limit number of results', default: 100 }), (0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(1000)];
            _offset_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Offset for pagination', default: 0 }), (0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: function (obj) { return "limit" in obj; }, get: function (obj) { return obj.limit; }, set: function (obj, value) { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _limit_extraInitializers);
            __esDecorate(null, null, _offset_decorators, { kind: "field", name: "offset", static: false, private: false, access: { has: function (obj) { return "offset" in obj; }, get: function (obj) { return obj.offset; }, set: function (obj, value) { obj.offset = value; } }, metadata: _metadata }, _offset_initializers, _offset_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.JobQueryDto = JobQueryDto;
var JobStatusDto = function () {
    var _a;
    var _jobId_decorators;
    var _jobId_initializers = [];
    var _jobId_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _startedAt_decorators;
    var _startedAt_initializers = [];
    var _startedAt_extraInitializers = [];
    var _completedAt_decorators;
    var _completedAt_initializers = [];
    var _completedAt_extraInitializers = [];
    var _failedAt_decorators;
    var _failedAt_initializers = [];
    var _failedAt_extraInitializers = [];
    var _progress_decorators;
    var _progress_initializers = [];
    var _progress_extraInitializers = [];
    var _attempts_decorators;
    var _attempts_initializers = [];
    var _attempts_extraInitializers = [];
    var _error_decorators;
    var _error_initializers = [];
    var _error_extraInitializers = [];
    var _result_decorators;
    var _result_initializers = [];
    var _result_extraInitializers = [];
    var _duration_decorators;
    var _duration_initializers = [];
    var _duration_extraInitializers = [];
    return _a = /** @class */ (function () {
            function JobStatusDto() {
                this.jobId = __runInitializers(this, _jobId_initializers, void 0);
                this.type = (__runInitializers(this, _jobId_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.status = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.createdAt = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
                this.startedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _startedAt_initializers, void 0));
                this.completedAt = (__runInitializers(this, _startedAt_extraInitializers), __runInitializers(this, _completedAt_initializers, void 0));
                this.failedAt = (__runInitializers(this, _completedAt_extraInitializers), __runInitializers(this, _failedAt_initializers, void 0));
                this.progress = (__runInitializers(this, _failedAt_extraInitializers), __runInitializers(this, _progress_initializers, void 0));
                this.attempts = (__runInitializers(this, _progress_extraInitializers), __runInitializers(this, _attempts_initializers, void 0));
                this.error = (__runInitializers(this, _attempts_extraInitializers), __runInitializers(this, _error_initializers, void 0));
                this.result = (__runInitializers(this, _error_extraInitializers), __runInitializers(this, _result_initializers, void 0));
                this.duration = (__runInitializers(this, _result_extraInitializers), __runInitializers(this, _duration_initializers, void 0));
                __runInitializers(this, _duration_extraInitializers);
            }
            return JobStatusDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _jobId_decorators = [(0, swagger_1.ApiProperty)({ description: 'Job ID' })];
            _type_decorators = [(0, swagger_1.ApiProperty)({ enum: job_interface_1.JobType, description: 'Job type' })];
            _status_decorators = [(0, swagger_1.ApiProperty)({ enum: job_interface_1.JobStatus, description: 'Current job status' })];
            _createdAt_decorators = [(0, swagger_1.ApiProperty)({ description: 'Job creation timestamp' })];
            _startedAt_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Job start timestamp' })];
            _completedAt_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Job completion timestamp' })];
            _failedAt_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Job failure timestamp' })];
            _progress_decorators = [(0, swagger_1.ApiProperty)({ description: 'Job progress percentage (0-100)' })];
            _attempts_decorators = [(0, swagger_1.ApiProperty)({ description: 'Number of attempts made' })];
            _error_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Error message if job failed' })];
            _result_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Job result data' })];
            _duration_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Job duration in milliseconds' })];
            __esDecorate(null, null, _jobId_decorators, { kind: "field", name: "jobId", static: false, private: false, access: { has: function (obj) { return "jobId" in obj; }, get: function (obj) { return obj.jobId; }, set: function (obj, value) { obj.jobId = value; } }, metadata: _metadata }, _jobId_initializers, _jobId_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _startedAt_decorators, { kind: "field", name: "startedAt", static: false, private: false, access: { has: function (obj) { return "startedAt" in obj; }, get: function (obj) { return obj.startedAt; }, set: function (obj, value) { obj.startedAt = value; } }, metadata: _metadata }, _startedAt_initializers, _startedAt_extraInitializers);
            __esDecorate(null, null, _completedAt_decorators, { kind: "field", name: "completedAt", static: false, private: false, access: { has: function (obj) { return "completedAt" in obj; }, get: function (obj) { return obj.completedAt; }, set: function (obj, value) { obj.completedAt = value; } }, metadata: _metadata }, _completedAt_initializers, _completedAt_extraInitializers);
            __esDecorate(null, null, _failedAt_decorators, { kind: "field", name: "failedAt", static: false, private: false, access: { has: function (obj) { return "failedAt" in obj; }, get: function (obj) { return obj.failedAt; }, set: function (obj, value) { obj.failedAt = value; } }, metadata: _metadata }, _failedAt_initializers, _failedAt_extraInitializers);
            __esDecorate(null, null, _progress_decorators, { kind: "field", name: "progress", static: false, private: false, access: { has: function (obj) { return "progress" in obj; }, get: function (obj) { return obj.progress; }, set: function (obj, value) { obj.progress = value; } }, metadata: _metadata }, _progress_initializers, _progress_extraInitializers);
            __esDecorate(null, null, _attempts_decorators, { kind: "field", name: "attempts", static: false, private: false, access: { has: function (obj) { return "attempts" in obj; }, get: function (obj) { return obj.attempts; }, set: function (obj, value) { obj.attempts = value; } }, metadata: _metadata }, _attempts_initializers, _attempts_extraInitializers);
            __esDecorate(null, null, _error_decorators, { kind: "field", name: "error", static: false, private: false, access: { has: function (obj) { return "error" in obj; }, get: function (obj) { return obj.error; }, set: function (obj, value) { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            __esDecorate(null, null, _result_decorators, { kind: "field", name: "result", static: false, private: false, access: { has: function (obj) { return "result" in obj; }, get: function (obj) { return obj.result; }, set: function (obj, value) { obj.result = value; } }, metadata: _metadata }, _result_initializers, _result_extraInitializers);
            __esDecorate(null, null, _duration_decorators, { kind: "field", name: "duration", static: false, private: false, access: { has: function (obj) { return "duration" in obj; }, get: function (obj) { return obj.duration; }, set: function (obj, value) { obj.duration = value; } }, metadata: _metadata }, _duration_initializers, _duration_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.JobStatusDto = JobStatusDto;
var QueueStatusDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _waiting_decorators;
    var _waiting_initializers = [];
    var _waiting_extraInitializers = [];
    var _active_decorators;
    var _active_initializers = [];
    var _active_extraInitializers = [];
    var _completed_decorators;
    var _completed_initializers = [];
    var _completed_extraInitializers = [];
    var _failed_decorators;
    var _failed_initializers = [];
    var _failed_extraInitializers = [];
    var _delayed_decorators;
    var _delayed_initializers = [];
    var _delayed_extraInitializers = [];
    var _paused_decorators;
    var _paused_initializers = [];
    var _paused_extraInitializers = [];
    var _completedRate_decorators;
    var _completedRate_initializers = [];
    var _completedRate_extraInitializers = [];
    var _failedRate_decorators;
    var _failedRate_initializers = [];
    var _failedRate_extraInitializers = [];
    var _avgProcessingTime_decorators;
    var _avgProcessingTime_initializers = [];
    var _avgProcessingTime_extraInitializers = [];
    return _a = /** @class */ (function () {
            function QueueStatusDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.waiting = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _waiting_initializers, void 0));
                this.active = (__runInitializers(this, _waiting_extraInitializers), __runInitializers(this, _active_initializers, void 0));
                this.completed = (__runInitializers(this, _active_extraInitializers), __runInitializers(this, _completed_initializers, void 0));
                this.failed = (__runInitializers(this, _completed_extraInitializers), __runInitializers(this, _failed_initializers, void 0));
                this.delayed = (__runInitializers(this, _failed_extraInitializers), __runInitializers(this, _delayed_initializers, void 0));
                this.paused = (__runInitializers(this, _delayed_extraInitializers), __runInitializers(this, _paused_initializers, void 0));
                this.completedRate = (__runInitializers(this, _paused_extraInitializers), __runInitializers(this, _completedRate_initializers, void 0));
                this.failedRate = (__runInitializers(this, _completedRate_extraInitializers), __runInitializers(this, _failedRate_initializers, void 0));
                this.avgProcessingTime = (__runInitializers(this, _failedRate_extraInitializers), __runInitializers(this, _avgProcessingTime_initializers, void 0));
                __runInitializers(this, _avgProcessingTime_extraInitializers);
            }
            return QueueStatusDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiProperty)({ description: 'Queue name' })];
            _waiting_decorators = [(0, swagger_1.ApiProperty)({ description: 'Number of waiting jobs' })];
            _active_decorators = [(0, swagger_1.ApiProperty)({ description: 'Number of active jobs' })];
            _completed_decorators = [(0, swagger_1.ApiProperty)({ description: 'Number of completed jobs' })];
            _failed_decorators = [(0, swagger_1.ApiProperty)({ description: 'Number of failed jobs' })];
            _delayed_decorators = [(0, swagger_1.ApiProperty)({ description: 'Number of delayed jobs' })];
            _paused_decorators = [(0, swagger_1.ApiProperty)({ description: 'Whether the queue is paused' })];
            _completedRate_decorators = [(0, swagger_1.ApiProperty)({ description: 'Completion rate percentage' })];
            _failedRate_decorators = [(0, swagger_1.ApiProperty)({ description: 'Failure rate percentage' })];
            _avgProcessingTime_decorators = [(0, swagger_1.ApiProperty)({ description: 'Average processing time in milliseconds' })];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _waiting_decorators, { kind: "field", name: "waiting", static: false, private: false, access: { has: function (obj) { return "waiting" in obj; }, get: function (obj) { return obj.waiting; }, set: function (obj, value) { obj.waiting = value; } }, metadata: _metadata }, _waiting_initializers, _waiting_extraInitializers);
            __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: function (obj) { return "active" in obj; }, get: function (obj) { return obj.active; }, set: function (obj, value) { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
            __esDecorate(null, null, _completed_decorators, { kind: "field", name: "completed", static: false, private: false, access: { has: function (obj) { return "completed" in obj; }, get: function (obj) { return obj.completed; }, set: function (obj, value) { obj.completed = value; } }, metadata: _metadata }, _completed_initializers, _completed_extraInitializers);
            __esDecorate(null, null, _failed_decorators, { kind: "field", name: "failed", static: false, private: false, access: { has: function (obj) { return "failed" in obj; }, get: function (obj) { return obj.failed; }, set: function (obj, value) { obj.failed = value; } }, metadata: _metadata }, _failed_initializers, _failed_extraInitializers);
            __esDecorate(null, null, _delayed_decorators, { kind: "field", name: "delayed", static: false, private: false, access: { has: function (obj) { return "delayed" in obj; }, get: function (obj) { return obj.delayed; }, set: function (obj, value) { obj.delayed = value; } }, metadata: _metadata }, _delayed_initializers, _delayed_extraInitializers);
            __esDecorate(null, null, _paused_decorators, { kind: "field", name: "paused", static: false, private: false, access: { has: function (obj) { return "paused" in obj; }, get: function (obj) { return obj.paused; }, set: function (obj, value) { obj.paused = value; } }, metadata: _metadata }, _paused_initializers, _paused_extraInitializers);
            __esDecorate(null, null, _completedRate_decorators, { kind: "field", name: "completedRate", static: false, private: false, access: { has: function (obj) { return "completedRate" in obj; }, get: function (obj) { return obj.completedRate; }, set: function (obj, value) { obj.completedRate = value; } }, metadata: _metadata }, _completedRate_initializers, _completedRate_extraInitializers);
            __esDecorate(null, null, _failedRate_decorators, { kind: "field", name: "failedRate", static: false, private: false, access: { has: function (obj) { return "failedRate" in obj; }, get: function (obj) { return obj.failedRate; }, set: function (obj, value) { obj.failedRate = value; } }, metadata: _metadata }, _failedRate_initializers, _failedRate_extraInitializers);
            __esDecorate(null, null, _avgProcessingTime_decorators, { kind: "field", name: "avgProcessingTime", static: false, private: false, access: { has: function (obj) { return "avgProcessingTime" in obj; }, get: function (obj) { return obj.avgProcessingTime; }, set: function (obj, value) { obj.avgProcessingTime = value; } }, metadata: _metadata }, _avgProcessingTime_initializers, _avgProcessingTime_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.QueueStatusDto = QueueStatusDto;
var CleanJobsDto = function () {
    var _a;
    var _grace_decorators;
    var _grace_initializers = [];
    var _grace_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CleanJobsDto() {
                this.grace = __runInitializers(this, _grace_initializers, void 0);
                this.status = (__runInitializers(this, _grace_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                __runInitializers(this, _status_extraInitializers);
            }
            return CleanJobsDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _grace_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Grace period in milliseconds',
                    example: 86400000 // 24 hours
                }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _status_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Job statuses to clean',
                    default: ['completed', 'failed']
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsEnum)(['completed', 'failed'], { each: true })];
            __esDecorate(null, null, _grace_decorators, { kind: "field", name: "grace", static: false, private: false, access: { has: function (obj) { return "grace" in obj; }, get: function (obj) { return obj.grace; }, set: function (obj, value) { obj.grace = value; } }, metadata: _metadata }, _grace_initializers, _grace_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CleanJobsDto = CleanJobsDto;
// Specific job data DTOs
var FileAnalysisJobDto = function () {
    var _a;
    var _fileId_decorators;
    var _fileId_initializers = [];
    var _fileId_extraInitializers = [];
    var _fileUrl_decorators;
    var _fileUrl_initializers = [];
    var _fileUrl_extraInitializers = [];
    var _fileName_decorators;
    var _fileName_initializers = [];
    var _fileName_extraInitializers = [];
    var _fileType_decorators;
    var _fileType_initializers = [];
    var _fileType_extraInitializers = [];
    var _analysisOptions_decorators;
    var _analysisOptions_initializers = [];
    var _analysisOptions_extraInitializers = [];
    return _a = /** @class */ (function () {
            function FileAnalysisJobDto() {
                this.fileId = __runInitializers(this, _fileId_initializers, void 0);
                this.fileUrl = (__runInitializers(this, _fileId_extraInitializers), __runInitializers(this, _fileUrl_initializers, void 0));
                this.fileName = (__runInitializers(this, _fileUrl_extraInitializers), __runInitializers(this, _fileName_initializers, void 0));
                this.fileType = (__runInitializers(this, _fileName_extraInitializers), __runInitializers(this, _fileType_initializers, void 0));
                this.analysisOptions = (__runInitializers(this, _fileType_extraInitializers), __runInitializers(this, _analysisOptions_initializers, void 0));
                __runInitializers(this, _analysisOptions_extraInitializers);
            }
            return FileAnalysisJobDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _fileId_decorators = [(0, swagger_1.ApiProperty)({ description: 'File ID to analyze' }), (0, class_validator_1.IsString)()];
            _fileUrl_decorators = [(0, swagger_1.ApiProperty)({ description: 'File URL for downloading' }), (0, class_validator_1.IsString)()];
            _fileName_decorators = [(0, swagger_1.ApiProperty)({ description: 'Original file name' }), (0, class_validator_1.IsString)()];
            _fileType_decorators = [(0, swagger_1.ApiProperty)({ description: 'File type/extension' }), (0, class_validator_1.IsString)()];
            _analysisOptions_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Analysis options' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _fileId_decorators, { kind: "field", name: "fileId", static: false, private: false, access: { has: function (obj) { return "fileId" in obj; }, get: function (obj) { return obj.fileId; }, set: function (obj, value) { obj.fileId = value; } }, metadata: _metadata }, _fileId_initializers, _fileId_extraInitializers);
            __esDecorate(null, null, _fileUrl_decorators, { kind: "field", name: "fileUrl", static: false, private: false, access: { has: function (obj) { return "fileUrl" in obj; }, get: function (obj) { return obj.fileUrl; }, set: function (obj, value) { obj.fileUrl = value; } }, metadata: _metadata }, _fileUrl_initializers, _fileUrl_extraInitializers);
            __esDecorate(null, null, _fileName_decorators, { kind: "field", name: "fileName", static: false, private: false, access: { has: function (obj) { return "fileName" in obj; }, get: function (obj) { return obj.fileName; }, set: function (obj, value) { obj.fileName = value; } }, metadata: _metadata }, _fileName_initializers, _fileName_extraInitializers);
            __esDecorate(null, null, _fileType_decorators, { kind: "field", name: "fileType", static: false, private: false, access: { has: function (obj) { return "fileType" in obj; }, get: function (obj) { return obj.fileType; }, set: function (obj, value) { obj.fileType = value; } }, metadata: _metadata }, _fileType_initializers, _fileType_extraInitializers);
            __esDecorate(null, null, _analysisOptions_decorators, { kind: "field", name: "analysisOptions", static: false, private: false, access: { has: function (obj) { return "analysisOptions" in obj; }, get: function (obj) { return obj.analysisOptions; }, set: function (obj, value) { obj.analysisOptions = value; } }, metadata: _metadata }, _analysisOptions_initializers, _analysisOptions_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.FileAnalysisJobDto = FileAnalysisJobDto;
var QuoteCalculationJobDto = function () {
    var _a;
    var _quoteId_decorators;
    var _quoteId_initializers = [];
    var _quoteId_extraInitializers = [];
    var _items_decorators;
    var _items_initializers = [];
    var _items_extraInitializers = [];
    var _rushOrder_decorators;
    var _rushOrder_initializers = [];
    var _rushOrder_extraInitializers = [];
    var _currency_decorators;
    var _currency_initializers = [];
    var _currency_extraInitializers = [];
    return _a = /** @class */ (function () {
            function QuoteCalculationJobDto() {
                this.quoteId = __runInitializers(this, _quoteId_initializers, void 0);
                this.items = (__runInitializers(this, _quoteId_extraInitializers), __runInitializers(this, _items_initializers, void 0));
                this.rushOrder = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _rushOrder_initializers, void 0));
                this.currency = (__runInitializers(this, _rushOrder_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
                __runInitializers(this, _currency_extraInitializers);
            }
            return QuoteCalculationJobDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _quoteId_decorators = [(0, swagger_1.ApiProperty)({ description: 'Quote ID to calculate' }), (0, class_validator_1.IsString)()];
            _items_decorators = [(0, swagger_1.ApiProperty)({ description: 'Quote items to calculate', type: [Object] }), (0, class_validator_1.IsArray)()];
            _rushOrder_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Rush order flag' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _currency_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Currency code', default: 'MXN' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _quoteId_decorators, { kind: "field", name: "quoteId", static: false, private: false, access: { has: function (obj) { return "quoteId" in obj; }, get: function (obj) { return obj.quoteId; }, set: function (obj, value) { obj.quoteId = value; } }, metadata: _metadata }, _quoteId_initializers, _quoteId_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: function (obj) { return "items" in obj; }, get: function (obj) { return obj.items; }, set: function (obj, value) { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            __esDecorate(null, null, _rushOrder_decorators, { kind: "field", name: "rushOrder", static: false, private: false, access: { has: function (obj) { return "rushOrder" in obj; }, get: function (obj) { return obj.rushOrder; }, set: function (obj, value) { obj.rushOrder = value; } }, metadata: _metadata }, _rushOrder_initializers, _rushOrder_extraInitializers);
            __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: function (obj) { return "currency" in obj; }, get: function (obj) { return obj.currency; }, set: function (obj, value) { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.QuoteCalculationJobDto = QuoteCalculationJobDto;
var EmailNotificationJobDto = function () {
    var _a;
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _recipientEmail_decorators;
    var _recipientEmail_initializers = [];
    var _recipientEmail_extraInitializers = [];
    var _recipientName_decorators;
    var _recipientName_initializers = [];
    var _recipientName_extraInitializers = [];
    var _templateData_decorators;
    var _templateData_initializers = [];
    var _templateData_extraInitializers = [];
    var _attachments_decorators;
    var _attachments_initializers = [];
    var _attachments_extraInitializers = [];
    return _a = /** @class */ (function () {
            function EmailNotificationJobDto() {
                this.type = __runInitializers(this, _type_initializers, void 0);
                this.recipientEmail = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _recipientEmail_initializers, void 0));
                this.recipientName = (__runInitializers(this, _recipientEmail_extraInitializers), __runInitializers(this, _recipientName_initializers, void 0));
                this.templateData = (__runInitializers(this, _recipientName_extraInitializers), __runInitializers(this, _templateData_initializers, void 0));
                this.attachments = (__runInitializers(this, _templateData_extraInitializers), __runInitializers(this, _attachments_initializers, void 0));
                __runInitializers(this, _attachments_extraInitializers);
            }
            return EmailNotificationJobDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, swagger_1.ApiProperty)({
                    enum: ['quote-ready', 'quote-accepted', 'quote-expired', 'order-shipped'],
                    description: 'Email notification type'
                }), (0, class_validator_1.IsEnum)(['quote-ready', 'quote-accepted', 'quote-expired', 'order-shipped'])];
            _recipientEmail_decorators = [(0, swagger_1.ApiProperty)({ description: 'Recipient email address' }), (0, class_validator_1.IsString)()];
            _recipientName_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Recipient name' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _templateData_decorators = [(0, swagger_1.ApiProperty)({ description: 'Template data for email rendering' }), (0, class_validator_1.IsObject)()];
            _attachments_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Email attachments', type: [Object] }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _recipientEmail_decorators, { kind: "field", name: "recipientEmail", static: false, private: false, access: { has: function (obj) { return "recipientEmail" in obj; }, get: function (obj) { return obj.recipientEmail; }, set: function (obj, value) { obj.recipientEmail = value; } }, metadata: _metadata }, _recipientEmail_initializers, _recipientEmail_extraInitializers);
            __esDecorate(null, null, _recipientName_decorators, { kind: "field", name: "recipientName", static: false, private: false, access: { has: function (obj) { return "recipientName" in obj; }, get: function (obj) { return obj.recipientName; }, set: function (obj, value) { obj.recipientName = value; } }, metadata: _metadata }, _recipientName_initializers, _recipientName_extraInitializers);
            __esDecorate(null, null, _templateData_decorators, { kind: "field", name: "templateData", static: false, private: false, access: { has: function (obj) { return "templateData" in obj; }, get: function (obj) { return obj.templateData; }, set: function (obj, value) { obj.templateData = value; } }, metadata: _metadata }, _templateData_initializers, _templateData_extraInitializers);
            __esDecorate(null, null, _attachments_decorators, { kind: "field", name: "attachments", static: false, private: false, access: { has: function (obj) { return "attachments" in obj; }, get: function (obj) { return obj.attachments; }, set: function (obj, value) { obj.attachments = value; } }, metadata: _metadata }, _attachments_initializers, _attachments_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.EmailNotificationJobDto = EmailNotificationJobDto;
var ReportGenerationJobDto = function () {
    var _a;
    var _reportType_decorators;
    var _reportType_initializers = [];
    var _reportType_extraInitializers = [];
    var _entityId_decorators;
    var _entityId_initializers = [];
    var _entityId_extraInitializers = [];
    var _format_decorators;
    var _format_initializers = [];
    var _format_extraInitializers = [];
    var _options_decorators;
    var _options_initializers = [];
    var _options_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ReportGenerationJobDto() {
                this.reportType = __runInitializers(this, _reportType_initializers, void 0);
                this.entityId = (__runInitializers(this, _reportType_extraInitializers), __runInitializers(this, _entityId_initializers, void 0));
                this.format = (__runInitializers(this, _entityId_extraInitializers), __runInitializers(this, _format_initializers, void 0));
                this.options = (__runInitializers(this, _format_extraInitializers), __runInitializers(this, _options_initializers, void 0));
                __runInitializers(this, _options_extraInitializers);
            }
            return ReportGenerationJobDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _reportType_decorators = [(0, swagger_1.ApiProperty)({
                    enum: ['quote', 'order', 'invoice', 'analytics'],
                    description: 'Report type to generate'
                }), (0, class_validator_1.IsEnum)(['quote', 'order', 'invoice', 'analytics'])];
            _entityId_decorators = [(0, swagger_1.ApiProperty)({ description: 'Entity ID for the report' }), (0, class_validator_1.IsString)()];
            _format_decorators = [(0, swagger_1.ApiProperty)({
                    enum: ['pdf', 'excel', 'csv'],
                    description: 'Report output format'
                }), (0, class_validator_1.IsEnum)(['pdf', 'excel', 'csv'])];
            _options_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Report generation options' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _reportType_decorators, { kind: "field", name: "reportType", static: false, private: false, access: { has: function (obj) { return "reportType" in obj; }, get: function (obj) { return obj.reportType; }, set: function (obj, value) { obj.reportType = value; } }, metadata: _metadata }, _reportType_initializers, _reportType_extraInitializers);
            __esDecorate(null, null, _entityId_decorators, { kind: "field", name: "entityId", static: false, private: false, access: { has: function (obj) { return "entityId" in obj; }, get: function (obj) { return obj.entityId; }, set: function (obj, value) { obj.entityId = value; } }, metadata: _metadata }, _entityId_initializers, _entityId_extraInitializers);
            __esDecorate(null, null, _format_decorators, { kind: "field", name: "format", static: false, private: false, access: { has: function (obj) { return "format" in obj; }, get: function (obj) { return obj.format; }, set: function (obj, value) { obj.format = value; } }, metadata: _metadata }, _format_initializers, _format_extraInitializers);
            __esDecorate(null, null, _options_decorators, { kind: "field", name: "options", static: false, private: false, access: { has: function (obj) { return "options" in obj; }, get: function (obj) { return obj.options; }, set: function (obj, value) { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ReportGenerationJobDto = ReportGenerationJobDto;
