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
exports.AuditInterceptor = exports.Audit = exports.AUDIT_KEY = void 0;
var common_1 = require("@nestjs/common");
var operators_1 = require("rxjs/operators");
exports.AUDIT_KEY = 'audit';
/**
 * Decorator to enable audit logging on a controller method
 */
var Audit = function (metadata) { return (0, common_2.SetMetadata)(exports.AUDIT_KEY, metadata); };
exports.Audit = Audit;
var common_2 = require("@nestjs/common");
var AuditInterceptor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuditInterceptor = _classThis = /** @class */ (function () {
        function AuditInterceptor_1(reflector, auditService) {
            this.reflector = reflector;
            this.auditService = auditService;
        }
        AuditInterceptor_1.prototype.intercept = function (context, next) {
            var _this = this;
            var auditMetadata = this.reflector.get(exports.AUDIT_KEY, context.getHandler());
            if (!auditMetadata) {
                return next.handle();
            }
            var request = context.switchToHttp().getRequest();
            var method = request.method, url = request.url, body = request.body, params = request.params, query = request.query, user = request.user;
            // Extract entity ID from params
            var entityId = auditMetadata.entityIdParam
                ? params[auditMetadata.entityIdParam]
                : params.id || (body === null || body === void 0 ? void 0 : body.id) || 'unknown';
            // Prepare audit data
            var auditData = {
                method: method,
                url: url,
                userId: user === null || user === void 0 ? void 0 : user.id,
                userEmail: user === null || user === void 0 ? void 0 : user.email,
            };
            if (auditMetadata.includeBody && body) {
                auditData.requestBody = this.sanitizeData(body, auditMetadata.sensitive);
            }
            if (query && Object.keys(query).length > 0) {
                auditData.queryParams = query;
            }
            var startTime = Date.now();
            return next.handle().pipe((0, operators_1.tap)({
                next: function (response) { return __awaiter(_this, void 0, void 0, function () {
                    var duration, metadata;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                duration = Date.now() - startTime;
                                metadata = __assign(__assign({}, auditData), { duration: duration, success: true });
                                if (auditMetadata.includeResponse && response) {
                                    metadata.response = this.sanitizeData(response, auditMetadata.sensitive);
                                }
                                return [4 /*yield*/, this.auditService.logAction(auditMetadata.entity, entityId, auditMetadata.action, metadata)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); },
                error: function (error) { return __awaiter(_this, void 0, void 0, function () {
                    var duration;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                duration = Date.now() - startTime;
                                return [4 /*yield*/, this.auditService.logAction(auditMetadata.entity, entityId, auditMetadata.action, __assign(__assign({}, auditData), { duration: duration, success: false, error: {
                                            name: error.name,
                                            message: error.message,
                                            statusCode: error.status,
                                        } }))];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); },
            }));
        };
        /**
         * Sanitize sensitive data
         */
        AuditInterceptor_1.prototype.sanitizeData = function (data, sensitive) {
            if (!data)
                return data;
            if (sensitive) {
                return { _masked: true };
            }
            // Clone the data to avoid modifying the original
            var sanitized = JSON.parse(JSON.stringify(data));
            // Remove sensitive fields
            var sensitiveFields = [
                'password',
                'passwordHash',
                'refreshToken',
                'accessToken',
                'apiKey',
                'secret',
                'token',
                'creditCard',
                'cvv',
                'ssn',
            ];
            var removeSensitiveFields = function (obj) {
                if (typeof obj !== 'object' || obj === null)
                    return;
                var _loop_1 = function (key) {
                    if (sensitiveFields.some(function (field) { return key.toLowerCase().includes(field); })) {
                        obj[key] = '***REDACTED***';
                    }
                    else if (typeof obj[key] === 'object') {
                        removeSensitiveFields(obj[key]);
                    }
                };
                for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
                    var key = _a[_i];
                    _loop_1(key);
                }
            };
            removeSensitiveFields(sanitized);
            return sanitized;
        };
        return AuditInterceptor_1;
    }());
    __setFunctionName(_classThis, "AuditInterceptor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuditInterceptor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuditInterceptor = _classThis;
}();
exports.AuditInterceptor = AuditInterceptor;
