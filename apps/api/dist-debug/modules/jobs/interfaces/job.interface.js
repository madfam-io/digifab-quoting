"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStatus = exports.JobType = void 0;
var JobType;
(function (JobType) {
    JobType["FILE_ANALYSIS"] = "file-analysis";
    JobType["QUOTE_CALCULATION"] = "quote-calculation";
    JobType["EMAIL_NOTIFICATION"] = "email-notification";
    JobType["REPORT_GENERATION"] = "report-generation";
})(JobType || (exports.JobType = JobType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["PROCESSING"] = "processing";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
    JobStatus["DELAYED"] = "delayed";
    JobStatus["STALLED"] = "stalled";
    JobStatus["STUCK"] = "stuck";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
