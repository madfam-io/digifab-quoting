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
exports.QuoteItemResponseDto = exports.AddQuoteItemDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var AddQuoteItemDto = function () {
    var _a;
    var _fileId_decorators;
    var _fileId_initializers = [];
    var _fileId_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _process_decorators;
    var _process_initializers = [];
    var _process_extraInitializers = [];
    var _quantity_decorators;
    var _quantity_initializers = [];
    var _quantity_extraInitializers = [];
    var _options_decorators;
    var _options_initializers = [];
    var _options_extraInitializers = [];
    var _requiredBy_decorators;
    var _requiredBy_initializers = [];
    var _requiredBy_extraInitializers = [];
    return _a = /** @class */ (function () {
            function AddQuoteItemDto() {
                this.fileId = __runInitializers(this, _fileId_initializers, void 0);
                this.name = (__runInitializers(this, _fileId_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.process = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _process_initializers, void 0));
                this.quantity = (__runInitializers(this, _process_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.options = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _options_initializers, void 0));
                this.requiredBy = (__runInitializers(this, _options_extraInitializers), __runInitializers(this, _requiredBy_initializers, void 0));
                __runInitializers(this, _requiredBy_extraInitializers);
            }
            return AddQuoteItemDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _fileId_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'ID of the uploaded file to quote',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                    format: 'uuid'
                }), (0, class_validator_1.IsUUID)()];
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Custom name for the part/item',
                    example: 'Custom Bracket v2',
                    maxLength: 100
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _process_decorators = [(0, swagger_1.ApiProperty)({
                    enum: ['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'],
                    description: 'Manufacturing process type',
                    example: '3d_fff'
                }), (0, class_validator_1.IsEnum)(['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'])];
            _quantity_decorators = [(0, swagger_1.ApiProperty)({
                    minimum: 1,
                    maximum: 10000,
                    description: 'Quantity to manufacture',
                    example: 10
                }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(10000)];
            _options_decorators = [(0, swagger_1.ApiProperty)({
                    type: 'object',
                    description: 'Process-specific options (material, finish, etc.)',
                    example: {
                        material: 'PLA',
                        color: 'black',
                        infill: 20,
                        layerHeight: 0.2,
                        supportMaterial: false
                    }
                }), (0, class_validator_1.IsObject)()];
            _requiredBy_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Required delivery date (ISO 8601 format)',
                    example: '2024-02-01T00:00:00.000Z',
                    format: 'date-time'
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            __esDecorate(null, null, _fileId_decorators, { kind: "field", name: "fileId", static: false, private: false, access: { has: function (obj) { return "fileId" in obj; }, get: function (obj) { return obj.fileId; }, set: function (obj, value) { obj.fileId = value; } }, metadata: _metadata }, _fileId_initializers, _fileId_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _process_decorators, { kind: "field", name: "process", static: false, private: false, access: { has: function (obj) { return "process" in obj; }, get: function (obj) { return obj.process; }, set: function (obj, value) { obj.process = value; } }, metadata: _metadata }, _process_initializers, _process_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: function (obj) { return "quantity" in obj; }, get: function (obj) { return obj.quantity; }, set: function (obj, value) { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _options_decorators, { kind: "field", name: "options", static: false, private: false, access: { has: function (obj) { return "options" in obj; }, get: function (obj) { return obj.options; }, set: function (obj, value) { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            __esDecorate(null, null, _requiredBy_decorators, { kind: "field", name: "requiredBy", static: false, private: false, access: { has: function (obj) { return "requiredBy" in obj; }, get: function (obj) { return obj.requiredBy; }, set: function (obj, value) { obj.requiredBy = value; } }, metadata: _metadata }, _requiredBy_initializers, _requiredBy_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.AddQuoteItemDto = AddQuoteItemDto;
var QuoteItemResponseDto = function () {
    var _a;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _fileId_decorators;
    var _fileId_initializers = [];
    var _fileId_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _process_decorators;
    var _process_initializers = [];
    var _process_extraInitializers = [];
    var _quantity_decorators;
    var _quantity_initializers = [];
    var _quantity_extraInitializers = [];
    var _unitPrice_decorators;
    var _unitPrice_initializers = [];
    var _unitPrice_extraInitializers = [];
    var _totalPrice_decorators;
    var _totalPrice_initializers = [];
    var _totalPrice_extraInitializers = [];
    var _leadTimeDays_decorators;
    var _leadTimeDays_initializers = [];
    var _leadTimeDays_extraInitializers = [];
    var _options_decorators;
    var _options_initializers = [];
    var _options_extraInitializers = [];
    return _a = /** @class */ (function () {
            function QuoteItemResponseDto() {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.fileId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _fileId_initializers, void 0));
                this.name = (__runInitializers(this, _fileId_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.process = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _process_initializers, void 0));
                this.quantity = (__runInitializers(this, _process_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.unitPrice = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
                this.totalPrice = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _totalPrice_initializers, void 0));
                this.leadTimeDays = (__runInitializers(this, _totalPrice_extraInitializers), __runInitializers(this, _leadTimeDays_initializers, void 0));
                this.options = (__runInitializers(this, _leadTimeDays_extraInitializers), __runInitializers(this, _options_initializers, void 0));
                __runInitializers(this, _options_extraInitializers);
            }
            return QuoteItemResponseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Quote item ID',
                    example: 'item_123e4567'
                })];
            _fileId_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Associated file ID',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                })];
            _name_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Item name',
                    example: 'Custom Bracket v2'
                })];
            _process_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Manufacturing process',
                    example: '3d_fff'
                })];
            _quantity_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Quantity',
                    example: 10
                })];
            _unitPrice_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Unit price',
                    example: 25.50
                })];
            _totalPrice_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Total price for this item',
                    example: 255.00
                })];
            _leadTimeDays_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Estimated lead time in days',
                    example: 3
                })];
            _options_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Process options applied',
                    example: { material: 'PLA', color: 'black' }
                })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _fileId_decorators, { kind: "field", name: "fileId", static: false, private: false, access: { has: function (obj) { return "fileId" in obj; }, get: function (obj) { return obj.fileId; }, set: function (obj, value) { obj.fileId = value; } }, metadata: _metadata }, _fileId_initializers, _fileId_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _process_decorators, { kind: "field", name: "process", static: false, private: false, access: { has: function (obj) { return "process" in obj; }, get: function (obj) { return obj.process; }, set: function (obj, value) { obj.process = value; } }, metadata: _metadata }, _process_initializers, _process_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: function (obj) { return "quantity" in obj; }, get: function (obj) { return obj.quantity; }, set: function (obj, value) { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: function (obj) { return "unitPrice" in obj; }, get: function (obj) { return obj.unitPrice; }, set: function (obj, value) { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
            __esDecorate(null, null, _totalPrice_decorators, { kind: "field", name: "totalPrice", static: false, private: false, access: { has: function (obj) { return "totalPrice" in obj; }, get: function (obj) { return obj.totalPrice; }, set: function (obj, value) { obj.totalPrice = value; } }, metadata: _metadata }, _totalPrice_initializers, _totalPrice_extraInitializers);
            __esDecorate(null, null, _leadTimeDays_decorators, { kind: "field", name: "leadTimeDays", static: false, private: false, access: { has: function (obj) { return "leadTimeDays" in obj; }, get: function (obj) { return obj.leadTimeDays; }, set: function (obj, value) { obj.leadTimeDays = value; } }, metadata: _metadata }, _leadTimeDays_initializers, _leadTimeDays_extraInitializers);
            __esDecorate(null, null, _options_decorators, { kind: "field", name: "options", static: false, private: false, access: { has: function (obj) { return "options" in obj; }, get: function (obj) { return obj.options; }, set: function (obj, value) { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.QuoteItemResponseDto = QuoteItemResponseDto;
