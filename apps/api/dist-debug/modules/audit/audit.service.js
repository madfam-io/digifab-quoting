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
exports.AuditService = exports.AuditEntity = exports.AuditAction = void 0;
var common_1 = require("@nestjs/common");
var shared_1 = require("@madfam/shared");
Object.defineProperty(exports, "AuditAction", { enumerable: true, get: function () { return shared_1.AuditAction; } });
Object.defineProperty(exports, "AuditEntity", { enumerable: true, get: function () { return shared_1.AuditEntity; } });
var AuditService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuditService = _classThis = /** @class */ (function () {
        function AuditService_1(prisma, tenantContext) {
            this.prisma = prisma;
            this.tenantContext = tenantContext;
        }
        /**
         * Log an audit entry
         */
        AuditService_1.prototype.log = function (entry) {
            return __awaiter(this, void 0, void 0, function () {
                var context, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            context = this.tenantContext.getContext();
                            if (!(context === null || context === void 0 ? void 0 : context.tenantId)) {
                                // Skip audit logging if no tenant context
                                return [2 /*return*/];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.prisma.auditLog.create({
                                    data: {
                                        tenantId: context.tenantId,
                                        actorId: context.userId,
                                        entity: entry.entity,
                                        entityId: entry.entityId,
                                        action: entry.action,
                                        before: entry.before || undefined,
                                        after: entry.after || undefined,
                                        metadata: __assign(__assign({}, entry.metadata), { requestId: context.requestId, userRoles: context.userRoles }),
                                    },
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            // Log error but don't throw - audit logging should not break the application
                            console.error('Failed to create audit log:', error_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Log a create action
         */
        AuditService_1.prototype.logCreate = function (entity, entityId, data, metadata) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.log({
                                entity: entity,
                                entityId: entityId,
                                action: shared_1.AuditAction.CREATE,
                                after: data,
                                metadata: metadata,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Log an update action
         */
        AuditService_1.prototype.logUpdate = function (entity, entityId, before, after, metadata) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Only log if there are actual changes
                            if (JSON.stringify(before) === JSON.stringify(after)) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.log({
                                    entity: entity,
                                    entityId: entityId,
                                    action: shared_1.AuditAction.UPDATE,
                                    before: before,
                                    after: after,
                                    metadata: metadata,
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Log a delete action
         */
        AuditService_1.prototype.logDelete = function (entity, entityId, data, metadata) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.log({
                                entity: entity,
                                entityId: entityId,
                                action: shared_1.AuditAction.DELETE,
                                before: data,
                                metadata: metadata,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Log a custom action
         */
        AuditService_1.prototype.logAction = function (entity, entityId, action, metadata) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.log({
                                entity: entity,
                                entityId: entityId,
                                action: action,
                                metadata: metadata,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Query audit logs
         */
        AuditService_1.prototype.findLogs = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var context, where, _a, logs, total;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            context = this.tenantContext.getContext();
                            if (!(context === null || context === void 0 ? void 0 : context.tenantId)) {
                                return [2 /*return*/, { logs: [], total: 0 }];
                            }
                            where = {
                                tenantId: context.tenantId,
                            };
                            if (params.entity)
                                where.entity = params.entity;
                            if (params.entityId)
                                where.entityId = params.entityId;
                            if (params.actorId)
                                where.actorId = params.actorId;
                            if (params.action)
                                where.action = params.action;
                            if (params.from || params.to) {
                                where.at = {};
                                if (params.from)
                                    where.at.gte = params.from;
                                if (params.to)
                                    where.at.lte = params.to;
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.auditLog.findMany({
                                        where: where,
                                        orderBy: { at: 'desc' },
                                        take: params.limit || 50,
                                        skip: params.offset || 0,
                                        include: {
                                            actor: {
                                                select: {
                                                    id: true,
                                                    email: true,
                                                    firstName: true,
                                                    lastName: true,
                                                },
                                            },
                                        },
                                    }),
                                    this.prisma.auditLog.count({ where: where }),
                                ])];
                        case 1:
                            _a = _b.sent(), logs = _a[0], total = _a[1];
                            return [2 /*return*/, { logs: logs, total: total }];
                    }
                });
            });
        };
        /**
         * Get audit trail for a specific entity
         */
        AuditService_1.prototype.getEntityAuditTrail = function (entity, entityId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.findLogs({ entity: entity, entityId: entityId })];
                });
            });
        };
        /**
         * Get audit logs for a specific user
         */
        AuditService_1.prototype.getUserAuditLogs = function (userId, params) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.findLogs({
                            actorId: userId,
                            from: params === null || params === void 0 ? void 0 : params.from,
                            to: params === null || params === void 0 ? void 0 : params.to,
                            limit: params === null || params === void 0 ? void 0 : params.limit,
                        })];
                });
            });
        };
        /**
         * Export audit logs (for compliance)
         */
        AuditService_1.prototype.exportAuditLogs = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var logs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findLogs({
                                from: params.from,
                                to: params.to,
                                entity: params.entity,
                                limit: 10000, // Max export size
                            })];
                        case 1:
                            logs = (_a.sent()).logs;
                            // Log the export action itself
                            return [4 /*yield*/, this.logAction(shared_1.AuditEntity.CONFIG, 'audit_export', shared_1.AuditAction.EXPORT, {
                                    exportParams: params,
                                    recordCount: logs.length,
                                })];
                        case 2:
                            // Log the export action itself
                            _a.sent();
                            return [2 /*return*/, logs];
                    }
                });
            });
        };
        return AuditService_1;
    }());
    __setFunctionName(_classThis, "AuditService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuditService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuditService = _classThis;
}();
exports.AuditService = AuditService;
