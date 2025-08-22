"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@nestjs/core");
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var helmet_1 = __importDefault(require("helmet"));
var app_module_1 = require("./app.module");
var prisma_service_1 = require("./prisma/prisma.service");
var all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
var logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
var tenant_context_service_1 = require("./modules/tenant/tenant-context.service");
var logger_service_1 = require("./common/logger/logger.service");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        var app, tenantContext, loggerService, config, document_1, prismaService, port, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Starting bootstrap...');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    console.log('Creating NestJS application...');
                    return [4 /*yield*/, core_1.NestFactory.create(app_module_1.AppModule, {
                            logger: ['log', 'error', 'warn', 'debug', 'verbose'], // Use console logger for debugging
                        })];
                case 2:
                    app = _b.sent();
                    console.log('NestJS application created');
                    // Get services
                    console.log('Getting services...');
                    tenantContext = app.get(tenant_context_service_1.TenantContextService);
                    loggerService = app.get(logger_service_1.LoggerService);
                    loggerService.setContext('Main');
                    console.log('Services initialized');
                    // Security
                    console.log('Setting up security...');
                    app.use((0, helmet_1.default)());
                    app.enableCors({
                        origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:3000'],
                        credentials: true,
                    });
                    // Global filters and interceptors
                    console.log('Setting up filters and interceptors...');
                    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(tenantContext));
                    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(tenantContext));
                    // Global pipes
                    app.useGlobalPipes(new common_1.ValidationPipe({
                        whitelist: true,
                        transform: true,
                        forbidNonWhitelisted: true,
                    }));
                    // API prefix
                    app.setGlobalPrefix('api/v1');
                    // Swagger documentation
                    console.log('Setting up Swagger...');
                    config = new swagger_1.DocumentBuilder()
                        .setTitle('MADFAM Quoting API')
                        .setVersion('1.0')
                        .addBearerAuth()
                        .build();
                    document_1 = swagger_1.SwaggerModule.createDocument(app, config);
                    swagger_1.SwaggerModule.setup('api/docs', app, document_1);
                    // Enable shutdown hooks
                    console.log('Enabling shutdown hooks...');
                    prismaService = app.get(prisma_service_1.PrismaService);
                    return [4 /*yield*/, prismaService.enableShutdownHooks(app)];
                case 3:
                    _b.sent();
                    port = process.env.PORT || 4000;
                    console.log("Starting server on port ".concat(port, "..."));
                    return [4 /*yield*/, app.listen(port)];
                case 4:
                    _b.sent();
                    console.log("API server running on http://localhost:".concat(port));
                    console.log("Swagger docs available at http://localhost:".concat(port, "/api/docs"));
                    console.log("Environment: ".concat(process.env.NODE_ENV || 'development'));
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    console.error('Bootstrap error:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
bootstrap();
