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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var audit_service_1 = require("./audit.service");
var role_shortcuts_decorator_1 = require("../auth/decorators/role-shortcuts.decorator");
var audit_interceptor_1 = require("./audit.interceptor");
var permissions_guard_1 = require("../auth/guards/permissions.guard");
var api_response_dto_1 = require("../../common/dto/api-response.dto");
var AuditController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('audit'), (0, common_1.Controller)('api/v1/audit'), (0, role_shortcuts_decorator_1.InternalOnly)(), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiHeader)({
            name: 'X-Tenant-ID',
            description: 'Tenant identifier for multi-tenant operations',
            required: false
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findLogs_decorators;
    var _getEntityAuditTrail_decorators;
    var _getUserAuditLogs_decorators;
    var _exportAuditLogs_decorators;
    var AuditController = _classThis = /** @class */ (function () {
        function AuditController_1(auditService, tenantContext) {
            this.auditService = (__runInitializers(this, _instanceExtraInitializers), auditService);
            this.tenantContext = tenantContext;
        }
        AuditController_1.prototype.findLogs = function (entity, entityId, actorId, action, from, to, limit, offset) {
            return __awaiter(this, void 0, void 0, function () {
                var context;
                var _a, _b;
                return __generator(this, function (_c) {
                    context = this.tenantContext.getContext();
                    if (!((_a = context === null || context === void 0 ? void 0 : context.userRoles) === null || _a === void 0 ? void 0 : _a.includes('admin')) && actorId && context && actorId !== context.userId) {
                        throw new common_1.ForbiddenException('You can only view your own audit logs');
                    }
                    return [2 /*return*/, this.auditService.findLogs({
                            entity: entity,
                            entityId: entityId,
                            actorId: actorId || (!((_b = context === null || context === void 0 ? void 0 : context.userRoles) === null || _b === void 0 ? void 0 : _b.includes('admin')) ? context === null || context === void 0 ? void 0 : context.userId : undefined),
                            action: action,
                            from: from ? new Date(from) : undefined,
                            to: to ? new Date(to) : undefined,
                            limit: limit,
                            offset: offset,
                        })];
                });
            });
        };
        AuditController_1.prototype.getEntityAuditTrail = function (entity, entityId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.auditService.getEntityAuditTrail(entity, entityId)];
                });
            });
        };
        AuditController_1.prototype.getUserAuditLogs = function (userId, from, to, limit) {
            return __awaiter(this, void 0, void 0, function () {
                var context;
                var _a;
                return __generator(this, function (_b) {
                    context = this.tenantContext.getContext();
                    if (!((_a = context === null || context === void 0 ? void 0 : context.userRoles) === null || _a === void 0 ? void 0 : _a.includes('admin')) && context && userId !== context.userId) {
                        throw new common_1.ForbiddenException('You can only view your own audit logs');
                    }
                    return [2 /*return*/, this.auditService.getUserAuditLogs(userId, {
                            from: from ? new Date(from) : undefined,
                            to: to ? new Date(to) : undefined,
                            limit: limit,
                        })];
                });
            });
        };
        AuditController_1.prototype.exportAuditLogs = function (from_1, to_1, entity_1) {
            return __awaiter(this, arguments, void 0, function (from, to, entity, format) {
                var logs;
                if (format === void 0) { format = 'json'; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.auditService.exportAuditLogs({
                                from: new Date(from),
                                to: new Date(to),
                                entity: entity,
                                format: format,
                            })];
                        case 1:
                            logs = _a.sent();
                            if (format === 'csv') {
                                // Convert to CSV format
                                return [2 /*return*/, this.convertToCSV(logs)];
                            }
                            return [2 /*return*/, logs];
                    }
                });
            });
        };
        AuditController_1.prototype.convertToCSV = function (logs) {
            if (logs.length === 0)
                return '';
            // Define CSV headers
            var headers = [
                'Timestamp',
                'Tenant ID',
                'Actor ID',
                'Actor Email',
                'Entity',
                'Entity ID',
                'Action',
                'Success',
                'Duration (ms)',
                'Request ID',
            ];
            // Convert logs to CSV rows
            var rows = logs.map(function (log) {
                var _a, _b, _c, _d, _e;
                return [
                    log.at.toISOString(),
                    log.tenantId,
                    log.actorId || '',
                    ((_a = log.actor) === null || _a === void 0 ? void 0 : _a.email) || '',
                    log.entity,
                    log.entityId,
                    log.action,
                    (_c = (_b = log.metadata) === null || _b === void 0 ? void 0 : _b.success) !== null && _c !== void 0 ? _c : true,
                    ((_d = log.metadata) === null || _d === void 0 ? void 0 : _d.duration) || '',
                    ((_e = log.metadata) === null || _e === void 0 ? void 0 : _e.requestId) || '',
                ];
            });
            // Combine headers and rows
            var csv = __spreadArray([
                headers.join(',')
            ], rows.map(function (row) { return row.map(function (cell) { return "\"".concat(cell, "\""); }).join(','); }), true).join('\n');
            return csv;
        };
        return AuditController_1;
    }());
    __setFunctionName(_classThis, "AuditController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findLogs_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({
                summary: 'Get audit logs',
                description: 'Retrieve audit logs with filtering options. Non-admin users can only view their own logs.'
            }), (0, swagger_1.ApiQuery)({
                name: 'entity',
                required: false,
                enum: audit_service_1.AuditEntity,
                description: 'Filter by entity type'
            }), (0, swagger_1.ApiQuery)({
                name: 'entityId',
                required: false,
                description: 'Filter by specific entity ID',
                example: '123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiQuery)({
                name: 'actorId',
                required: false,
                description: 'Filter by actor/user ID',
                example: 'user_123'
            }), (0, swagger_1.ApiQuery)({
                name: 'action',
                required: false,
                enum: audit_service_1.AuditAction,
                description: 'Filter by action type'
            }), (0, swagger_1.ApiQuery)({
                name: 'from',
                required: false,
                type: Date,
                description: 'Start date for date range filter',
                example: '2024-01-01T00:00:00.000Z'
            }), (0, swagger_1.ApiQuery)({
                name: 'to',
                required: false,
                type: Date,
                description: 'End date for date range filter',
                example: '2024-12-31T23:59:59.999Z'
            }), (0, swagger_1.ApiQuery)({
                name: 'limit',
                required: false,
                type: Number,
                description: 'Maximum number of records to return (default: 50)'
            }), (0, swagger_1.ApiQuery)({
                name: 'offset',
                required: false,
                type: Number,
                description: 'Number of records to skip for pagination (default: 0)'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Audit logs retrieved successfully',
                schema: {
                    properties: {
                        logs: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: 'audit_123' },
                                    tenantId: { type: 'string', example: 'tenant_456' },
                                    actorId: { type: 'string', example: 'user_789' },
                                    actorEmail: { type: 'string', example: 'user@example.com' },
                                    entity: { type: 'string', example: 'quote' },
                                    entityId: { type: 'string', example: 'quote_123' },
                                    action: { type: 'string', example: 'create' },
                                    at: { type: 'string', format: 'date-time' },
                                    metadata: { type: 'object' },
                                    changes: { type: 'object' },
                                    requestId: { type: 'string', example: 'req_abc123' },
                                    duration: { type: 'number', example: 125 }
                                }
                            }
                        },
                        total: { type: 'number', example: 100 },
                        limit: { type: 'number', example: 50 },
                        offset: { type: 'number', example: 0 }
                    }
                }
            }), (0, swagger_1.ApiForbiddenResponse)({
                description: 'Insufficient permissions',
                type: api_response_dto_1.ForbiddenResponseDto
            }), (0, permissions_guard_1.RequirePermissions)(permissions_guard_1.Permission.AUDIT_READ), (0, audit_interceptor_1.Audit)({
                entity: audit_service_1.AuditEntity.CONFIG,
                action: audit_service_1.AuditAction.READ,
                includeBody: false,
            })];
        _getEntityAuditTrail_decorators = [(0, common_1.Get)('entity/:entity/:entityId'), (0, swagger_1.ApiOperation)({
                summary: 'Get audit trail for a specific entity',
                description: 'Retrieve complete audit history for a specific entity instance'
            }), (0, swagger_1.ApiParam)({
                name: 'entity',
                description: 'Entity type',
                enum: audit_service_1.AuditEntity
            }), (0, swagger_1.ApiParam)({
                name: 'entityId',
                description: 'Entity ID',
                example: '123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Entity audit trail retrieved',
                schema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            action: { type: 'string' },
                            actorId: { type: 'string' },
                            actorEmail: { type: 'string' },
                            at: { type: 'string', format: 'date-time' },
                            changes: { type: 'object' },
                            metadata: { type: 'object' }
                        }
                    }
                }
            }), (0, permissions_guard_1.RequirePermissions)(permissions_guard_1.Permission.AUDIT_READ)];
        _getUserAuditLogs_decorators = [(0, common_1.Get)('user/:userId'), (0, swagger_1.ApiOperation)({
                summary: 'Get audit logs for a specific user',
                description: 'Retrieve all actions performed by a specific user. Non-admin users can only view their own logs.'
            }), (0, swagger_1.ApiParam)({
                name: 'userId',
                description: 'User ID',
                example: 'user_123'
            }), (0, swagger_1.ApiQuery)({
                name: 'from',
                required: false,
                type: Date,
                description: 'Start date for filtering',
                example: '2024-01-01T00:00:00.000Z'
            }), (0, swagger_1.ApiQuery)({
                name: 'to',
                required: false,
                type: Date,
                description: 'End date for filtering',
                example: '2024-12-31T23:59:59.999Z'
            }), (0, swagger_1.ApiQuery)({
                name: 'limit',
                required: false,
                type: Number,
                description: 'Maximum number of records (default: 50)'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'User audit logs retrieved',
                schema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            entity: { type: 'string' },
                            entityId: { type: 'string' },
                            action: { type: 'string' },
                            at: { type: 'string', format: 'date-time' },
                            metadata: { type: 'object' }
                        }
                    }
                }
            }), (0, swagger_1.ApiForbiddenResponse)({
                description: 'Cannot view other users audit logs',
                type: api_response_dto_1.ForbiddenResponseDto
            }), (0, permissions_guard_1.RequirePermissions)(permissions_guard_1.Permission.AUDIT_READ)];
        _exportAuditLogs_decorators = [(0, common_1.Get)('export'), (0, swagger_1.ApiOperation)({
                summary: 'Export audit logs',
                description: 'Export audit logs for compliance and reporting purposes. Admin only.'
            }), (0, swagger_1.ApiQuery)({
                name: 'from',
                required: true,
                type: Date,
                description: 'Export start date',
                example: '2024-01-01T00:00:00.000Z'
            }), (0, swagger_1.ApiQuery)({
                name: 'to',
                required: true,
                type: Date,
                description: 'Export end date',
                example: '2024-12-31T23:59:59.999Z'
            }), (0, swagger_1.ApiQuery)({
                name: 'entity',
                required: false,
                enum: audit_service_1.AuditEntity,
                description: 'Filter export by entity type'
            }), (0, swagger_1.ApiQuery)({
                name: 'format',
                required: false,
                enum: ['json', 'csv'],
                description: 'Export format (default: json)'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Audit logs exported',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: { type: 'object' }
                        }
                    },
                    'text/csv': {
                        schema: {
                            type: 'string',
                            example: 'Timestamp,Tenant ID,Actor ID,Actor Email,Entity,Entity ID,Action,Success,Duration (ms),Request ID\n2024-01-01T00:00:00.000Z,tenant_123,user_456,user@example.com,quote,quote_789,create,true,125,req_abc'
                        }
                    }
                }
            }), (0, swagger_1.ApiForbiddenResponse)({
                description: 'Admin access required',
                type: api_response_dto_1.ForbiddenResponseDto
            }), (0, role_shortcuts_decorator_1.AdminOnly)(), (0, permissions_guard_1.RequirePermissions)(permissions_guard_1.Permission.AUDIT_EXPORT)];
        __esDecorate(_classThis, null, _findLogs_decorators, { kind: "method", name: "findLogs", static: false, private: false, access: { has: function (obj) { return "findLogs" in obj; }, get: function (obj) { return obj.findLogs; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getEntityAuditTrail_decorators, { kind: "method", name: "getEntityAuditTrail", static: false, private: false, access: { has: function (obj) { return "getEntityAuditTrail" in obj; }, get: function (obj) { return obj.getEntityAuditTrail; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserAuditLogs_decorators, { kind: "method", name: "getUserAuditLogs", static: false, private: false, access: { has: function (obj) { return "getUserAuditLogs" in obj; }, get: function (obj) { return obj.getUserAuditLogs; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportAuditLogs_decorators, { kind: "method", name: "exportAuditLogs", static: false, private: false, access: { has: function (obj) { return "exportAuditLogs" in obj; }, get: function (obj) { return obj.exportAuditLogs; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuditController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuditController = _classThis;
}();
exports.AuditController = AuditController;
