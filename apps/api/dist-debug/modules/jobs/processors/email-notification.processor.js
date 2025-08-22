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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.EmailNotificationProcessor = void 0;
var bull_1 = require("@nestjs/bull");
var common_1 = require("@nestjs/common");
var job_interface_1 = require("../interfaces/job.interface");
var nodemailer = __importStar(require("nodemailer"));
var handlebars_1 = require("handlebars");
var error_handling_1 = require("@/common/utils/error-handling");
var EmailNotificationProcessor = function () {
    var _classDecorators = [(0, bull_1.Processor)(job_interface_1.JobType.EMAIL_NOTIFICATION), (0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleEmailNotification_decorators;
    var _onActive_decorators;
    var _onComplete_decorators;
    var _onFailed_decorators;
    var EmailNotificationProcessor = _classThis = /** @class */ (function () {
        function EmailNotificationProcessor_1(logger, configService) {
            this.logger = (__runInitializers(this, _instanceExtraInitializers), logger);
            this.configService = configService;
            this.templates = new Map();
            // Initialize email transporter
            this.transporter = nodemailer.createTransport({
                host: this.configService.get('email.smtp.host'),
                port: this.configService.get('email.smtp.port'),
                secure: this.configService.get('email.smtp.secure', false),
                auth: {
                    user: this.configService.get('email.smtp.user'),
                    pass: this.configService.get('email.smtp.pass'),
                },
            });
            this.defaultFrom = this.configService.get('email.defaultFrom', 'MADFAM Quoting <noreply@madfam.com>');
            // Load email templates
            this.loadTemplates();
        }
        EmailNotificationProcessor_1.prototype.handleEmailNotification = function (job) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, _a, type, recipientEmail, recipientName, templateData, attachments, tenantId, template, enrichedData, html, mailOptions, result, error_1;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            startTime = Date.now();
                            _a = job.data, type = _a.type, recipientEmail = _a.recipientEmail, recipientName = _a.recipientName, templateData = _a.templateData, attachments = _a.attachments, tenantId = _a.tenantId;
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 4, , 5]);
                            this.logger.log("Sending ".concat(type, " email to ").concat(recipientEmail), {
                                jobId: job.id,
                                tenantId: tenantId,
                                type: type,
                            });
                            template = this.templates.get(type);
                            if (!template) {
                                throw new Error("Email template ".concat(type, " not found"));
                            }
                            enrichedData = __assign({ recipientName: recipientName || 'Customer', year: new Date().getFullYear(), supportEmail: this.configService.get('email.supportEmail', 'support@madfam.com'), websiteUrl: this.configService.get('app.url', 'https://app.madfam.com') }, templateData);
                            html = template(enrichedData);
                            _b = {
                                from: this.defaultFrom,
                                to: recipientEmail,
                                subject: this.getEmailSubject(type, enrichedData),
                                html: html
                            };
                            return [4 /*yield*/, this.prepareAttachments(attachments)];
                        case 2:
                            mailOptions = (_b.attachments = _c.sent(),
                                _b);
                            return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                        case 3:
                            result = _c.sent();
                            this.logger.log("Email sent successfully", {
                                jobId: job.id,
                                messageId: result.messageId,
                                recipient: recipientEmail,
                                type: type,
                            });
                            return [2 /*return*/, {
                                    success: true,
                                    data: {
                                        messageId: result.messageId,
                                        accepted: result.accepted,
                                        rejected: result.rejected,
                                        response: result.response,
                                    },
                                    duration: Date.now() - startTime,
                                }];
                        case 4:
                            error_1 = _c.sent();
                            this.logger.error("Failed to send email", (0, error_handling_1.toError)(error_1));
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'EMAIL_SEND_FAILED',
                                        message: (0, error_handling_1.getErrorMessage)(error_1),
                                        details: error_1,
                                    },
                                    duration: Date.now() - startTime,
                                }];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        EmailNotificationProcessor_1.prototype.onActive = function (job) {
            this.logger.log("Email notification job ".concat(job.id, " started"), {
                type: job.data.type,
                recipient: job.data.recipientEmail,
            });
        };
        EmailNotificationProcessor_1.prototype.onComplete = function (job, result) {
            this.logger.log("Email notification job ".concat(job.id, " completed"), {
                type: job.data.type,
                recipient: job.data.recipientEmail,
                success: result.success,
            });
        };
        EmailNotificationProcessor_1.prototype.onFailed = function (job, err) {
            this.logger.error("Email notification job ".concat(job.id, " failed"), (0, error_handling_1.toError)(err));
        };
        EmailNotificationProcessor_1.prototype.loadTemplates = function () {
            // In production, these would be loaded from files or a template service
            // For now, using inline templates
            var templates = {
                'quote-ready': "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <style>\n            body { font-family: Arial, sans-serif; color: #333; }\n            .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }\n            .content { padding: 20px; }\n            .button { \n              display: inline-block; \n              padding: 12px 24px; \n              background-color: #007bff; \n              color: white; \n              text-decoration: none; \n              border-radius: 4px; \n            }\n            .footer { \n              margin-top: 40px; \n              padding-top: 20px; \n              border-top: 1px solid #e9ecef; \n              text-align: center; \n              color: #6c757d; \n              font-size: 14px; \n            }\n          </style>\n        </head>\n        <body>\n          <div class=\"container\">\n            <div class=\"header\">\n              <h1>Your Quote is Ready!</h1>\n            </div>\n            <div class=\"content\">\n              <p>Hi {{recipientName}},</p>\n              <p>Great news! Your quote #{{quoteNumber}} is ready for review.</p>\n              <p><strong>Quote Summary:</strong></p>\n              <ul>\n                <li>Items: {{itemCount}}</li>\n                <li>Total: {{currency}} {{total}}</li>\n                <li>Valid until: {{validUntil}}</li>\n              </ul>\n              <p>Click the button below to view and accept your quote:</p>\n              <p style=\"text-align: center;\">\n                <a href=\"{{quoteUrl}}\" class=\"button\">View Quote</a>\n              </p>\n              <p>If you have any questions, feel free to contact us at {{supportEmail}}.</p>\n              <p>Best regards,<br>The MADFAM Team</p>\n            </div>\n            <div class=\"footer\">\n              <p>&copy; {{year}} MADFAM. All rights reserved.</p>\n              <p>This email was sent to {{recipientEmail}}</p>\n            </div>\n          </div>\n        </body>\n        </html>\n      ",
                'quote-accepted': "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <style>\n            body { font-family: Arial, sans-serif; color: #333; }\n            .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }\n            .content { padding: 20px; }\n            .order-details { \n              background-color: #f8f9fa; \n              padding: 15px; \n              border-radius: 4px; \n              margin: 20px 0; \n            }\n            .footer { \n              margin-top: 40px; \n              padding-top: 20px; \n              border-top: 1px solid #e9ecef; \n              text-align: center; \n              color: #6c757d; \n              font-size: 14px; \n            }\n          </style>\n        </head>\n        <body>\n          <div class=\"container\">\n            <div class=\"header\">\n              <h1>Order Confirmed!</h1>\n            </div>\n            <div class=\"content\">\n              <p>Hi {{recipientName}},</p>\n              <p>Thank you for your order! We've received your payment and your order is now being processed.</p>\n              <div class=\"order-details\">\n                <h3>Order Details:</h3>\n                <p><strong>Order Number:</strong> {{orderNumber}}</p>\n                <p><strong>Quote Number:</strong> {{quoteNumber}}</p>\n                <p><strong>Total Paid:</strong> {{currency}} {{totalPaid}}</p>\n                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>\n              </div>\n              <p>We'll send you another email when your order ships with tracking information.</p>\n              <p>If you have any questions about your order, please contact us at {{supportEmail}}.</p>\n              <p>Thank you for choosing MADFAM!</p>\n              <p>Best regards,<br>The MADFAM Team</p>\n            </div>\n            <div class=\"footer\">\n              <p>&copy; {{year}} MADFAM. All rights reserved.</p>\n            </div>\n          </div>\n        </body>\n        </html>\n      ",
                'quote-expired': "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <style>\n            body { font-family: Arial, sans-serif; color: #333; }\n            .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n            .header { background-color: #ffc107; color: #333; padding: 20px; text-align: center; }\n            .content { padding: 20px; }\n            .button { \n              display: inline-block; \n              padding: 12px 24px; \n              background-color: #007bff; \n              color: white; \n              text-decoration: none; \n              border-radius: 4px; \n            }\n            .footer { \n              margin-top: 40px; \n              padding-top: 20px; \n              border-top: 1px solid #e9ecef; \n              text-align: center; \n              color: #6c757d; \n              font-size: 14px; \n            }\n          </style>\n        </head>\n        <body>\n          <div class=\"container\">\n            <div class=\"header\">\n              <h1>Your Quote Has Expired</h1>\n            </div>\n            <div class=\"content\">\n              <p>Hi {{recipientName}},</p>\n              <p>Your quote #{{quoteNumber}} has expired as of {{expirationDate}}.</p>\n              <p>Don't worry! You can easily request a new quote with updated pricing.</p>\n              <p style=\"text-align: center;\">\n                <a href=\"{{newQuoteUrl}}\" class=\"button\">Request New Quote</a>\n              </p>\n              <p>If you need assistance or have questions, please contact us at {{supportEmail}}.</p>\n              <p>Best regards,<br>The MADFAM Team</p>\n            </div>\n            <div class=\"footer\">\n              <p>&copy; {{year}} MADFAM. All rights reserved.</p>\n            </div>\n          </div>\n        </body>\n        </html>\n      ",
                'order-shipped': "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <style>\n            body { font-family: Arial, sans-serif; color: #333; }\n            .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n            .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; }\n            .content { padding: 20px; }\n            .tracking-info { \n              background-color: #f8f9fa; \n              padding: 15px; \n              border-radius: 4px; \n              margin: 20px 0; \n            }\n            .button { \n              display: inline-block; \n              padding: 12px 24px; \n              background-color: #007bff; \n              color: white; \n              text-decoration: none; \n              border-radius: 4px; \n            }\n            .footer { \n              margin-top: 40px; \n              padding-top: 20px; \n              border-top: 1px solid #e9ecef; \n              text-align: center; \n              color: #6c757d; \n              font-size: 14px; \n            }\n          </style>\n        </head>\n        <body>\n          <div class=\"container\">\n            <div class=\"header\">\n              <h1>Your Order Has Shipped!</h1>\n            </div>\n            <div class=\"content\">\n              <p>Hi {{recipientName}},</p>\n              <p>Great news! Your order #{{orderNumber}} has been shipped and is on its way to you.</p>\n              <div class=\"tracking-info\">\n                <h3>Shipping Information:</h3>\n                <p><strong>Carrier:</strong> {{carrier}}</p>\n                <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>\n                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>\n              </div>\n              <p style=\"text-align: center;\">\n                <a href=\"{{trackingUrl}}\" class=\"button\">Track Your Package</a>\n              </p>\n              <p>If you have any questions about your shipment, please contact us at {{supportEmail}}.</p>\n              <p>Thank you for your business!</p>\n              <p>Best regards,<br>The MADFAM Team</p>\n            </div>\n            <div class=\"footer\">\n              <p>&copy; {{year}} MADFAM. All rights reserved.</p>\n            </div>\n          </div>\n        </body>\n        </html>\n      ",
            };
            for (var _i = 0, _a = Object.entries(templates); _i < _a.length; _i++) {
                var _b = _a[_i], type = _b[0], templateHtml = _b[1];
                this.templates.set(type, (0, handlebars_1.compile)(templateHtml));
            }
        };
        EmailNotificationProcessor_1.prototype.getEmailSubject = function (type, data) {
            var subjects = {
                'quote-ready': "Your Quote #".concat(data.quoteNumber, " is Ready!"),
                'quote-accepted': "Order Confirmed - #".concat(data.orderNumber),
                'quote-expired': "Quote #".concat(data.quoteNumber, " Has Expired"),
                'order-shipped': "Your Order #".concat(data.orderNumber, " Has Shipped!"),
            };
            return subjects[type] || 'MADFAM Notification';
        };
        EmailNotificationProcessor_1.prototype.prepareAttachments = function (attachments) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!attachments || attachments.length === 0) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, attachments.map(function (attachment) { return ({
                            filename: attachment.filename,
                            path: attachment.path,
                            content: attachment.content,
                        }); })];
                });
            });
        };
        return EmailNotificationProcessor_1;
    }());
    __setFunctionName(_classThis, "EmailNotificationProcessor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleEmailNotification_decorators = [(0, bull_1.Process)()];
        _onActive_decorators = [(0, bull_1.OnQueueActive)()];
        _onComplete_decorators = [(0, bull_1.OnQueueCompleted)()];
        _onFailed_decorators = [(0, bull_1.OnQueueFailed)()];
        __esDecorate(_classThis, null, _handleEmailNotification_decorators, { kind: "method", name: "handleEmailNotification", static: false, private: false, access: { has: function (obj) { return "handleEmailNotification" in obj; }, get: function (obj) { return obj.handleEmailNotification; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onActive_decorators, { kind: "method", name: "onActive", static: false, private: false, access: { has: function (obj) { return "onActive" in obj; }, get: function (obj) { return obj.onActive; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onComplete_decorators, { kind: "method", name: "onComplete", static: false, private: false, access: { has: function (obj) { return "onComplete" in obj; }, get: function (obj) { return obj.onComplete; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onFailed_decorators, { kind: "method", name: "onFailed", static: false, private: false, access: { has: function (obj) { return "onFailed" in obj; }, get: function (obj) { return obj.onFailed; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EmailNotificationProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EmailNotificationProcessor = _classThis;
}();
exports.EmailNotificationProcessor = EmailNotificationProcessor;
