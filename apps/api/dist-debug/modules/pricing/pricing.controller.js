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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var api_response_dto_1 = require("../../common/dto/api-response.dto");
var PricingController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('pricing'), (0, common_1.Controller)('pricing'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiUnauthorizedResponse)({
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
    var _getMaterials_decorators;
    var _getMachines_decorators;
    var _getProcessOptions_decorators;
    var PricingController = _classThis = /** @class */ (function () {
        function PricingController_1(pricingService) {
            this.pricingService = (__runInitializers(this, _instanceExtraInitializers), pricingService);
        }
        PricingController_1.prototype.getMaterials = function (req, process) {
            return this.pricingService.getMaterials(req.user.tenantId, process);
        };
        PricingController_1.prototype.getMachines = function (req, process) {
            return this.pricingService.getMachines(req.user.tenantId, process);
        };
        PricingController_1.prototype.getProcessOptions = function (req, process) {
            return this.pricingService.getProcessOptions(req.user.tenantId, process);
        };
        return PricingController_1;
    }());
    __setFunctionName(_classThis, "PricingController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getMaterials_decorators = [(0, common_1.Get)('materials'), (0, swagger_1.ApiOperation)({
                summary: 'Get available materials',
                description: 'Retrieve list of materials available for a specific process or all processes'
            }), (0, swagger_1.ApiQuery)({
                name: 'process',
                required: false,
                enum: ['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'],
                description: 'Filter materials by manufacturing process'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'List of available materials',
                schema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: 'mat_pla_black' },
                            name: { type: 'string', example: 'PLA - Black' },
                            process: { type: 'string', example: '3d_fff' },
                            category: { type: 'string', example: 'thermoplastic' },
                            properties: {
                                type: 'object',
                                properties: {
                                    density: { type: 'number', example: 1.24 },
                                    tensileStrength: { type: 'number', example: 50 },
                                    flexuralModulus: { type: 'number', example: 2.3 },
                                    heatResistance: { type: 'number', example: 60 }
                                }
                            },
                            costPerUnit: { type: 'number', example: 25.00 },
                            unit: { type: 'string', example: 'kg' },
                            minOrderQty: { type: 'number', example: 0.1 },
                            leadTimeDays: { type: 'number', example: 0 },
                            colors: {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['black', 'white', 'red', 'blue']
                            },
                            finishes: {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['standard', 'smooth', 'matte']
                            },
                            sustainable: { type: 'boolean', example: true },
                            recyclable: { type: 'boolean', example: true }
                        }
                    }
                }
            })];
        _getMachines_decorators = [(0, common_1.Get)('machines'), (0, swagger_1.ApiOperation)({
                summary: 'Get available machines',
                description: 'Retrieve list of machines available for a specific process or all processes'
            }), (0, swagger_1.ApiQuery)({
                name: 'process',
                required: false,
                enum: ['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'],
                description: 'Filter machines by manufacturing process'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'List of available machines',
                schema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: 'machine_prusa_mk4' },
                            name: { type: 'string', example: 'Prusa MK4' },
                            process: { type: 'string', example: '3d_fff' },
                            manufacturer: { type: 'string', example: 'Prusa Research' },
                            model: { type: 'string', example: 'MK4' },
                            buildVolume: {
                                type: 'object',
                                properties: {
                                    x: { type: 'number', example: 250 },
                                    y: { type: 'number', example: 210 },
                                    z: { type: 'number', example: 220 }
                                }
                            },
                            resolution: {
                                type: 'object',
                                properties: {
                                    min: { type: 'number', example: 0.05 },
                                    max: { type: 'number', example: 0.3 },
                                    unit: { type: 'string', example: 'mm' }
                                }
                            },
                            materials: {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['PLA', 'PETG', 'ABS', 'TPU']
                            },
                            setupTime: { type: 'number', example: 15 },
                            hourlyRate: { type: 'number', example: 50.00 },
                            capabilities: {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['multi-material', 'auto-leveling', 'enclosed']
                            },
                            maxPartSize: { type: 'number', example: 200 },
                            tolerance: { type: 'number', example: 0.1 },
                            availability: { type: 'string', example: 'available' }
                        }
                    }
                }
            })];
        _getProcessOptions_decorators = [(0, common_1.Get)('process-options'), (0, swagger_1.ApiOperation)({
                summary: 'Get process options and constraints',
                description: 'Retrieve available options and constraints for each manufacturing process'
            }), (0, swagger_1.ApiQuery)({
                name: 'process',
                required: false,
                enum: ['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'],
                description: 'Get options for specific process only'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Process options and constraints',
                schema: {
                    type: 'object',
                    additionalProperties: {
                        type: 'object',
                        properties: {
                            process: { type: 'string', example: '3d_fff' },
                            name: { type: 'string', example: 'FFF/FDM 3D Printing' },
                            description: { type: 'string', example: 'Fused Filament Fabrication' },
                            options: {
                                type: 'object',
                                properties: {
                                    infillDensity: {
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string', example: 'range' },
                                            min: { type: 'number', example: 10 },
                                            max: { type: 'number', example: 100 },
                                            default: { type: 'number', example: 20 },
                                            unit: { type: 'string', example: '%' }
                                        }
                                    },
                                    layerHeight: {
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string', example: 'enum' },
                                            values: {
                                                type: 'array',
                                                items: { type: 'number' },
                                                example: [0.1, 0.15, 0.2, 0.3]
                                            },
                                            default: { type: 'number', example: 0.2 },
                                            unit: { type: 'string', example: 'mm' }
                                        }
                                    },
                                    supportMaterial: {
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string', example: 'boolean' },
                                            default: { type: 'boolean', example: false },
                                            costMultiplier: { type: 'number', example: 1.15 }
                                        }
                                    },
                                    wallThickness: {
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string', example: 'range' },
                                            min: { type: 'number', example: 0.8 },
                                            max: { type: 'number', example: 5 },
                                            default: { type: 'number', example: 1.2 },
                                            unit: { type: 'string', example: 'mm' }
                                        }
                                    }
                                }
                            },
                            constraints: {
                                type: 'object',
                                properties: {
                                    minWallThickness: { type: 'number', example: 0.8 },
                                    minFeatureSize: { type: 'number', example: 0.5 },
                                    maxOverhang: { type: 'number', example: 45 },
                                    maxBridgeLength: { type: 'number', example: 10 },
                                    requiresSupport: { type: 'boolean', example: true }
                                }
                            },
                            postProcessing: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', example: 'sanding' },
                                        name: { type: 'string', example: 'Sanding' },
                                        description: { type: 'string', example: 'Manual sanding for smooth finish' },
                                        costMultiplier: { type: 'number', example: 1.2 },
                                        timeMultiplier: { type: 'number', example: 1.5 }
                                    }
                                }
                            }
                        }
                    }
                }
            })];
        __esDecorate(_classThis, null, _getMaterials_decorators, { kind: "method", name: "getMaterials", static: false, private: false, access: { has: function (obj) { return "getMaterials" in obj; }, get: function (obj) { return obj.getMaterials; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMachines_decorators, { kind: "method", name: "getMachines", static: false, private: false, access: { has: function (obj) { return "getMachines" in obj; }, get: function (obj) { return obj.getMachines; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProcessOptions_decorators, { kind: "method", name: "getProcessOptions", static: false, private: false, access: { has: function (obj) { return "getProcessOptions" in obj; }, get: function (obj) { return obj.getProcessOptions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PricingController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PricingController = _classThis;
}();
exports.PricingController = PricingController;
