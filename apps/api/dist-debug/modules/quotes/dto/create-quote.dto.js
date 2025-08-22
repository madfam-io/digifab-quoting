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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteResponseDto = exports.CreateQuoteDto = exports.QuoteObjectiveDto = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var swagger_1 = require("@nestjs/swagger");
var QuoteObjectiveDto = function () {
    var _a;
    var _cost_decorators;
    var _cost_initializers = [];
    var _cost_extraInitializers = [];
    var _lead_decorators;
    var _lead_initializers = [];
    var _lead_extraInitializers = [];
    var _green_decorators;
    var _green_initializers = [];
    var _green_extraInitializers = [];
    return _a = /** @class */ (function () {
            function QuoteObjectiveDto() {
                this.cost = __runInitializers(this, _cost_initializers, void 0);
                this.lead = (__runInitializers(this, _cost_extraInitializers), __runInitializers(this, _lead_initializers, void 0));
                this.green = (__runInitializers(this, _lead_extraInitializers), __runInitializers(this, _green_initializers, void 0));
                __runInitializers(this, _green_extraInitializers);
            }
            return QuoteObjectiveDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _cost_decorators = [(0, swagger_1.ApiProperty)({
                    example: 0.5,
                    minimum: 0,
                    maximum: 1,
                    description: 'Weight for cost optimization (0-1). Higher values prioritize lower cost.'
                }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(1)];
            _lead_decorators = [(0, swagger_1.ApiProperty)({
                    example: 0.3,
                    minimum: 0,
                    maximum: 1,
                    description: 'Weight for lead time optimization (0-1). Higher values prioritize faster delivery.'
                }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(1)];
            _green_decorators = [(0, swagger_1.ApiProperty)({
                    example: 0.2,
                    minimum: 0,
                    maximum: 1,
                    description: 'Weight for sustainability (0-1). Higher values prioritize eco-friendly options.'
                }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(1)];
            __esDecorate(null, null, _cost_decorators, { kind: "field", name: "cost", static: false, private: false, access: { has: function (obj) { return "cost" in obj; }, get: function (obj) { return obj.cost; }, set: function (obj, value) { obj.cost = value; } }, metadata: _metadata }, _cost_initializers, _cost_extraInitializers);
            __esDecorate(null, null, _lead_decorators, { kind: "field", name: "lead", static: false, private: false, access: { has: function (obj) { return "lead" in obj; }, get: function (obj) { return obj.lead; }, set: function (obj, value) { obj.lead = value; } }, metadata: _metadata }, _lead_initializers, _lead_extraInitializers);
            __esDecorate(null, null, _green_decorators, { kind: "field", name: "green", static: false, private: false, access: { has: function (obj) { return "green" in obj; }, get: function (obj) { return obj.green; }, set: function (obj, value) { obj.green = value; } }, metadata: _metadata }, _green_initializers, _green_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.QuoteObjectiveDto = QuoteObjectiveDto;
var CreateQuoteDto = function () {
    var _a;
    var _currency_decorators;
    var _currency_initializers = [];
    var _currency_extraInitializers = [];
    var _objective_decorators;
    var _objective_initializers = [];
    var _objective_extraInitializers = [];
    var _metadata_decorators;
    var _metadata_initializers = [];
    var _metadata_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateQuoteDto() {
                this.currency = __runInitializers(this, _currency_initializers, void 0);
                this.objective = (__runInitializers(this, _currency_extraInitializers), __runInitializers(this, _objective_initializers, void 0));
                this.metadata = (__runInitializers(this, _objective_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
                __runInitializers(this, _metadata_extraInitializers);
            }
            return CreateQuoteDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _currency_decorators = [(0, swagger_1.ApiProperty)({
                    enum: ['MXN', 'USD'],
                    default: 'MXN',
                    description: 'Currency for the quote. Prices will be calculated in this currency.',
                    example: 'MXN'
                }), (0, class_validator_1.IsEnum)(['MXN', 'USD'])];
            _objective_decorators = [(0, swagger_1.ApiProperty)({
                    type: QuoteObjectiveDto,
                    description: 'Optimization objectives for quote calculation. Weights must sum to 1.0.',
                    example: {
                        cost: 0.5,
                        lead: 0.3,
                        green: 0.2
                    }
                }), (0, class_validator_1.IsObject)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(function () { return QuoteObjectiveDto; })];
            _metadata_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Additional metadata for the quote',
                    example: {
                        projectName: 'Custom Parts Q1',
                        department: 'Engineering',
                        poNumber: 'PO-12345'
                    }
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: function (obj) { return "currency" in obj; }, get: function (obj) { return obj.currency; }, set: function (obj, value) { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
            __esDecorate(null, null, _objective_decorators, { kind: "field", name: "objective", static: false, private: false, access: { has: function (obj) { return "objective" in obj; }, get: function (obj) { return obj.objective; }, set: function (obj, value) { obj.objective = value; } }, metadata: _metadata }, _objective_initializers, _objective_extraInitializers);
            __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: function (obj) { return "metadata" in obj; }, get: function (obj) { return obj.metadata; }, set: function (obj, value) { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateQuoteDto = CreateQuoteDto;
var QuoteResponseDto = function () {
    var _a;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _quoteNumber_decorators;
    var _quoteNumber_initializers = [];
    var _quoteNumber_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _currency_decorators;
    var _currency_initializers = [];
    var _currency_extraInitializers = [];
    var _totalAmount_decorators;
    var _totalAmount_initializers = [];
    var _totalAmount_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _expiresAt_decorators;
    var _expiresAt_initializers = [];
    var _expiresAt_extraInitializers = [];
    return _a = /** @class */ (function () {
            function QuoteResponseDto() {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.quoteNumber = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _quoteNumber_initializers, void 0));
                this.status = (__runInitializers(this, _quoteNumber_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.currency = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
                this.totalAmount = (__runInitializers(this, _currency_extraInitializers), __runInitializers(this, _totalAmount_initializers, void 0));
                this.createdAt = (__runInitializers(this, _totalAmount_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
                this.expiresAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
                __runInitializers(this, _expiresAt_extraInitializers);
            }
            return QuoteResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Unique quote identifier',
                    example: 'quote_123e4567-e89b-12d3-a456-426614174000'
                })];
            _quoteNumber_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Quote number for reference',
                    example: 'Q-2024-0001'
                })];
            _status_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Quote status',
                    enum: ['draft', 'calculating', 'ready', 'sent', 'accepted', 'rejected', 'expired', 'cancelled'],
                    example: 'draft'
                })];
            _currency_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Quote currency',
                    example: 'MXN'
                })];
            _totalAmount_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Total quote amount',
                    example: 1500.00
                })];
            _createdAt_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Quote creation timestamp',
                    example: '2024-01-01T00:00:00.000Z'
                })];
            _expiresAt_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Quote expiration date',
                    example: '2024-01-15T00:00:00.000Z'
                })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _quoteNumber_decorators, { kind: "field", name: "quoteNumber", static: false, private: false, access: { has: function (obj) { return "quoteNumber" in obj; }, get: function (obj) { return obj.quoteNumber; }, set: function (obj, value) { obj.quoteNumber = value; } }, metadata: _metadata }, _quoteNumber_initializers, _quoteNumber_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: function (obj) { return "currency" in obj; }, get: function (obj) { return obj.currency; }, set: function (obj, value) { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
            __esDecorate(null, null, _totalAmount_decorators, { kind: "field", name: "totalAmount", static: false, private: false, access: { has: function (obj) { return "totalAmount" in obj; }, get: function (obj) { return obj.totalAmount; }, set: function (obj, value) { obj.totalAmount = value; } }, metadata: _metadata }, _totalAmount_initializers, _totalAmount_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: function (obj) { return "expiresAt" in obj; }, get: function (obj) { return obj.expiresAt; }, set: function (obj, value) { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.QuoteResponseDto = QuoteResponseDto;
