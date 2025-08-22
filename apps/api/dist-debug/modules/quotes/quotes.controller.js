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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var create_quote_dto_1 = require("./dto/create-quote.dto");
var add_quote_item_dto_1 = require("./dto/add-quote-item.dto");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var shared_1 = require("@madfam/shared");
var audit_interceptor_1 = require("../audit/audit.interceptor");
var audit_service_1 = require("../audit/audit.service");
var api_response_dto_1 = require("../../common/dto/api-response.dto");
var QuotesController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('quotes'), (0, common_1.Controller)('quotes'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiUnauthorizedResponse)({
            description: 'Unauthorized - Invalid or missing JWT token',
            type: api_response_dto_1.UnauthorizedResponseDto
        }), (0, swagger_1.ApiHeader)({
            name: 'X-Tenant-ID',
            description: 'Tenant identifier for multi-tenant operations',
            required: false
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _findAll_decorators;
    var _findOne_decorators;
    var _update_decorators;
    var _addItem_decorators;
    var _calculate_decorators;
    var _approve_decorators;
    var _cancel_decorators;
    var _generatePdf_decorators;
    var QuotesController = _classThis = /** @class */ (function () {
        function QuotesController_1(quotesService) {
            this.quotesService = (__runInitializers(this, _instanceExtraInitializers), quotesService);
        }
        QuotesController_1.prototype.create = function (req, createQuoteDto) {
            return this.quotesService.create(req.user.tenantId, req.user.id, createQuoteDto);
        };
        QuotesController_1.prototype.findAll = function (req, status, customerId, page, pageSize) {
            return this.quotesService.findAll(req.user.tenantId, {
                status: status,
                customerId: customerId,
                page: page ? parseInt(page) : undefined,
                pageSize: pageSize ? parseInt(pageSize) : undefined,
            });
        };
        QuotesController_1.prototype.findOne = function (req, id) {
            return this.quotesService.findOne(req.user.tenantId, id);
        };
        QuotesController_1.prototype.update = function (req, id, updateQuoteDto) {
            return this.quotesService.update(req.user.tenantId, id, updateQuoteDto);
        };
        QuotesController_1.prototype.addItem = function (req, quoteId, addQuoteItemDto) {
            return this.quotesService.addItem(req.user.tenantId, quoteId, addQuoteItemDto);
        };
        QuotesController_1.prototype.calculate = function (req, id, calculateQuoteDto) {
            return this.quotesService.calculate(req.user.tenantId, id, calculateQuoteDto);
        };
        QuotesController_1.prototype.approve = function (req, id) {
            return this.quotesService.approve(req.user.tenantId, id, req.user.id);
        };
        QuotesController_1.prototype.cancel = function (req, id) {
            return this.quotesService.cancel(req.user.tenantId, id);
        };
        QuotesController_1.prototype.generatePdf = function (_req, _id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // TODO: Implement PDF generation
                    return [2 /*return*/, {
                            url: 'https://example.com/quote.pdf',
                            expiresAt: new Date(Date.now() + 3600000).toISOString()
                        }];
                });
            });
        };
        return QuotesController_1;
    }());
    __setFunctionName(_classThis, "QuotesController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)(), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED), (0, swagger_1.ApiOperation)({
                summary: 'Create new quote',
                description: 'Creates a new quote with specified currency and optimization objectives'
            }), (0, swagger_1.ApiResponse)({
                status: 201,
                description: 'Quote successfully created',
                type: create_quote_dto_1.QuoteResponseDto
            }), (0, swagger_1.ApiBadRequestResponse)({
                description: 'Invalid input data',
                type: api_response_dto_1.ValidationErrorResponseDto
            }), (0, audit_interceptor_1.Audit)({
                entity: audit_service_1.AuditEntity.QUOTE,
                action: audit_service_1.AuditAction.CREATE,
                includeBody: true,
                includeResponse: true,
            })];
        _findAll_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({
                summary: 'List quotes',
                description: 'Retrieve a paginated list of quotes with optional filtering'
            }), (0, swagger_1.ApiQuery)({
                name: 'status',
                required: false,
                enum: shared_1.QuoteStatus,
                description: 'Filter by quote status'
            }), (0, swagger_1.ApiQuery)({
                name: 'customerId',
                required: false,
                description: 'Filter by customer ID',
                example: '123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiQuery)({
                name: 'page',
                required: false,
                type: Number,
                description: 'Page number (1-based)',
                example: 1
            }), (0, swagger_1.ApiQuery)({
                name: 'pageSize',
                required: false,
                type: Number,
                description: 'Items per page',
                example: 20
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'List of quotes',
                schema: {
                    allOf: [
                        { $ref: '#/components/schemas/PaginatedResponseDto' },
                        {
                            properties: {
                                items: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/QuoteResponseDto' }
                                }
                            }
                        }
                    ]
                }
            })];
        _findOne_decorators = [(0, common_1.Get)(':id'), (0, swagger_1.ApiOperation)({
                summary: 'Get quote details',
                description: 'Retrieve detailed information about a specific quote'
            }), (0, swagger_1.ApiParam)({
                name: 'id',
                description: 'Quote ID',
                example: 'quote_123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Quote details',
                type: create_quote_dto_1.QuoteResponseDto
            }), (0, swagger_1.ApiNotFoundResponse)({
                description: 'Quote not found',
                type: api_response_dto_1.NotFoundResponseDto
            })];
        _update_decorators = [(0, common_1.Patch)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Update quote' })];
        _addItem_decorators = [(0, common_1.Post)(':id/items'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED), (0, swagger_1.ApiOperation)({
                summary: 'Add item to quote',
                description: 'Add a new part/item to an existing quote for pricing'
            }), (0, swagger_1.ApiParam)({
                name: 'id',
                description: 'Quote ID',
                example: 'quote_123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiResponse)({
                status: 201,
                description: 'Item added successfully',
                type: add_quote_item_dto_1.QuoteItemResponseDto
            }), (0, swagger_1.ApiNotFoundResponse)({
                description: 'Quote not found',
                type: api_response_dto_1.NotFoundResponseDto
            }), (0, swagger_1.ApiBadRequestResponse)({
                description: 'Invalid item data or quote is not in draft status',
                type: api_response_dto_1.ValidationErrorResponseDto
            })];
        _calculate_decorators = [(0, common_1.Post)(':id/calculate'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({
                summary: 'Calculate quote pricing',
                description: 'Triggers pricing calculation for all items in the quote based on objectives'
            }), (0, swagger_1.ApiParam)({
                name: 'id',
                description: 'Quote ID',
                example: 'quote_123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Quote calculation initiated',
                schema: {
                    properties: {
                        message: { type: 'string', example: 'Calculation started' },
                        jobId: { type: 'string', example: 'job_123456' },
                        estimatedTime: { type: 'number', example: 30 }
                    }
                }
            }), (0, swagger_1.ApiNotFoundResponse)({
                description: 'Quote not found',
                type: api_response_dto_1.NotFoundResponseDto
            }), (0, swagger_1.ApiBadRequestResponse)({
                description: 'Quote has no items or is already calculated',
                type: api_response_dto_1.ValidationErrorResponseDto
            })];
        _approve_decorators = [(0, common_1.Post)(':id/approve'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({
                summary: 'Customer approves quote',
                description: 'Customer accepts the quote and proceeds to order placement'
            }), (0, swagger_1.ApiParam)({
                name: 'id',
                description: 'Quote ID',
                example: 'quote_123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Quote approved successfully',
                schema: {
                    properties: {
                        message: { type: 'string', example: 'Quote approved' },
                        orderId: { type: 'string', example: 'order_123456' },
                        paymentUrl: { type: 'string', example: 'https://payment.stripe.com/...' }
                    }
                }
            }), (0, swagger_1.ApiNotFoundResponse)({
                description: 'Quote not found',
                type: api_response_dto_1.NotFoundResponseDto
            }), (0, swagger_1.ApiBadRequestResponse)({
                description: 'Quote is not in ready status or has expired',
                type: api_response_dto_1.ValidationErrorResponseDto
            })];
        _cancel_decorators = [(0, common_1.Post)(':id/cancel'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Cancel quote' })];
        _generatePdf_decorators = [(0, common_1.Get)(':id/pdf'), (0, swagger_1.ApiOperation)({
                summary: 'Generate quote PDF',
                description: 'Generate and return a PDF version of the quote for download/sharing'
            }), (0, swagger_1.ApiParam)({
                name: 'id',
                description: 'Quote ID',
                example: 'quote_123e4567-e89b-12d3-a456-426614174000'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'PDF URL returned',
                schema: {
                    properties: {
                        url: {
                            type: 'string',
                            example: 'https://s3.amazonaws.com/quotes/quote_123.pdf',
                            description: 'Presigned URL for PDF download (valid for 1 hour)'
                        },
                        expiresAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T01:00:00.000Z'
                        }
                    }
                }
            }), (0, swagger_1.ApiNotFoundResponse)({
                description: 'Quote not found',
                type: api_response_dto_1.NotFoundResponseDto
            })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addItem_decorators, { kind: "method", name: "addItem", static: false, private: false, access: { has: function (obj) { return "addItem" in obj; }, get: function (obj) { return obj.addItem; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _calculate_decorators, { kind: "method", name: "calculate", static: false, private: false, access: { has: function (obj) { return "calculate" in obj; }, get: function (obj) { return obj.calculate; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _approve_decorators, { kind: "method", name: "approve", static: false, private: false, access: { has: function (obj) { return "approve" in obj; }, get: function (obj) { return obj.approve; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: function (obj) { return "cancel" in obj; }, get: function (obj) { return obj.cancel; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generatePdf_decorators, { kind: "method", name: "generatePdf", static: false, private: false, access: { has: function (obj) { return "generatePdf" in obj; }, get: function (obj) { return obj.generatePdf; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QuotesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QuotesController = _classThis;
}();
exports.QuotesController = QuotesController;
