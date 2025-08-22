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
exports.CalculateQuoteDto = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var swagger_1 = require("@nestjs/swagger");
var add_quote_item_dto_1 = require("./add-quote-item.dto");
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
            _cost_decorators = [(0, swagger_1.ApiProperty)({ example: 0.5, minimum: 0, maximum: 1 })];
            _lead_decorators = [(0, swagger_1.ApiProperty)({ example: 0.3, minimum: 0, maximum: 1 })];
            _green_decorators = [(0, swagger_1.ApiProperty)({ example: 0.2, minimum: 0, maximum: 1 })];
            __esDecorate(null, null, _cost_decorators, { kind: "field", name: "cost", static: false, private: false, access: { has: function (obj) { return "cost" in obj; }, get: function (obj) { return obj.cost; }, set: function (obj, value) { obj.cost = value; } }, metadata: _metadata }, _cost_initializers, _cost_extraInitializers);
            __esDecorate(null, null, _lead_decorators, { kind: "field", name: "lead", static: false, private: false, access: { has: function (obj) { return "lead" in obj; }, get: function (obj) { return obj.lead; }, set: function (obj, value) { obj.lead = value; } }, metadata: _metadata }, _lead_initializers, _lead_extraInitializers);
            __esDecorate(null, null, _green_decorators, { kind: "field", name: "green", static: false, private: false, access: { has: function (obj) { return "green" in obj; }, get: function (obj) { return obj.green; }, set: function (obj, value) { obj.green = value; } }, metadata: _metadata }, _green_initializers, _green_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
var CalculateQuoteDto = function () {
    var _a;
    var _objective_decorators;
    var _objective_initializers = [];
    var _objective_extraInitializers = [];
    var _items_decorators;
    var _items_initializers = [];
    var _items_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CalculateQuoteDto() {
                this.objective = __runInitializers(this, _objective_initializers, void 0);
                this.items = (__runInitializers(this, _objective_extraInitializers), __runInitializers(this, _items_initializers, void 0));
                __runInitializers(this, _items_extraInitializers);
            }
            return CalculateQuoteDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _objective_decorators = [(0, swagger_1.ApiProperty)({ required: false, type: QuoteObjectiveDto }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(function () { return QuoteObjectiveDto; })];
            _items_decorators = [(0, swagger_1.ApiProperty)({ required: false, type: [add_quote_item_dto_1.AddQuoteItemDto] }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(function () { return add_quote_item_dto_1.AddQuoteItemDto; })];
            __esDecorate(null, null, _objective_decorators, { kind: "field", name: "objective", static: false, private: false, access: { has: function (obj) { return "objective" in obj; }, get: function (obj) { return obj.objective; }, set: function (obj, value) { obj.objective = value; } }, metadata: _metadata }, _objective_initializers, _objective_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: function (obj) { return "items" in obj; }, get: function (obj) { return obj.items; }, set: function (obj, value) { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CalculateQuoteDto = CalculateQuoteDto;
