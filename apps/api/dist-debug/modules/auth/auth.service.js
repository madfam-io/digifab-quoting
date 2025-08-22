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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
var common_1 = require("@nestjs/common");
var bcrypt = __importStar(require("bcryptjs"));
var AuthService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuthService = _classThis = /** @class */ (function () {
        function AuthService_1(usersService, jwtService, configService, prisma, cacheService) {
            this.usersService = usersService;
            this.jwtService = jwtService;
            this.configService = configService;
            this.prisma = prisma;
            this.cacheService = cacheService;
        }
        AuthService_1.prototype.validateUser = function (email, password) {
            return __awaiter(this, void 0, void 0, function () {
                var user, _a, _, result;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.usersService.findByEmail(email)];
                        case 1:
                            user = _c.sent();
                            _a = user && user.passwordHash;
                            if (!_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, bcrypt.compare(password, user.passwordHash)];
                        case 2:
                            _a = (_c.sent());
                            _c.label = 3;
                        case 3:
                            if (_a) {
                                _ = user.passwordHash, result = __rest(user, ["passwordHash"]);
                                return [2 /*return*/, {
                                        id: result.id,
                                        tenantId: result.tenantId,
                                        email: result.email,
                                        name: "".concat(result.firstName, " ").concat(result.lastName).trim(),
                                        roles: [result.role.toLowerCase()],
                                        active: result.active,
                                        lastLogin: (_b = result.lastLogin) === null || _b === void 0 ? void 0 : _b.toISOString(),
                                    }];
                            }
                            return [2 /*return*/, null];
                    }
                });
            });
        };
        AuthService_1.prototype.login = function (user) {
            return __awaiter(this, void 0, void 0, function () {
                var tokens, sessionData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.generateTokens(user)];
                        case 1:
                            tokens = _a.sent();
                            // Store session
                            return [4 /*yield*/, this.prisma.session.create({
                                    data: {
                                        userId: user.id,
                                        token: tokens.accessToken,
                                        refreshToken: tokens.refreshToken,
                                        expiresAt: new Date(Date.now() + (this.configService.get('jwt.refreshTokenExpiry') || 86400) * 1000),
                                    },
                                })];
                        case 2:
                            // Store session
                            _a.sent();
                            sessionData = {
                                userId: user.id,
                                email: user.email,
                                roles: user.roles,
                                tenantId: user.tenantId,
                                lastLogin: new Date(),
                            };
                            return [4 /*yield*/, this.cacheService.cacheUserSession(user.id, sessionData)];
                        case 3:
                            _a.sent();
                            // Update last login
                            return [4 /*yield*/, this.usersService.updateLastLogin(user.id)];
                        case 4:
                            // Update last login
                            _a.sent();
                            return [2 /*return*/, tokens];
                    }
                });
            });
        };
        AuthService_1.prototype.refreshTokens = function (refreshToken) {
            return __awaiter(this, void 0, void 0, function () {
                var session, user, tokens, error_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            // Verify refresh token
                            this.jwtService.verify(refreshToken, {
                                secret: this.configService.get('jwt.secret'),
                            });
                            return [4 /*yield*/, this.prisma.session.findUnique({
                                    where: { refreshToken: refreshToken },
                                    include: { user: true },
                                })];
                        case 1:
                            session = _b.sent();
                            if (!session || session.expiresAt < new Date()) {
                                throw new common_1.UnauthorizedException('Invalid refresh token');
                            }
                            user = {
                                id: session.user.id,
                                tenantId: session.user.tenantId,
                                email: session.user.email,
                                name: "".concat(session.user.firstName, " ").concat(session.user.lastName).trim(),
                                roles: [session.user.role.toLowerCase()],
                                active: session.user.active,
                                lastLogin: (_a = session.user.lastLogin) === null || _a === void 0 ? void 0 : _a.toISOString(),
                            };
                            return [4 /*yield*/, this.generateTokens(user)];
                        case 2:
                            tokens = _b.sent();
                            // Update session
                            return [4 /*yield*/, this.prisma.session.update({
                                    where: { id: session.id },
                                    data: {
                                        token: tokens.accessToken,
                                        refreshToken: tokens.refreshToken,
                                        expiresAt: new Date(Date.now() + (this.configService.get('jwt.refreshTokenExpiry') || 86400) * 1000),
                                    },
                                })];
                        case 3:
                            // Update session
                            _b.sent();
                            return [2 /*return*/, tokens];
                        case 4:
                            error_1 = _b.sent();
                            throw new common_1.UnauthorizedException('Invalid refresh token');
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.logout = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                var session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.session.findFirst({
                                where: { token: token },
                            })];
                        case 1:
                            session = _a.sent();
                            if (!session) return [3 /*break*/, 3];
                            // Clear cached session
                            return [4 /*yield*/, this.cacheService.invalidate("session:".concat(session.userId))];
                        case 2:
                            // Clear cached session
                            _a.sent();
                            _a.label = 3;
                        case 3: 
                        // Delete session from database
                        return [4 /*yield*/, this.prisma.session.deleteMany({
                                where: { token: token },
                            })];
                        case 4:
                            // Delete session from database
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.register = function (registerDto) {
            return __awaiter(this, void 0, void 0, function () {
                var existingUser, tenantId, defaultTenant, tenant, passwordHash, user, _pwd, userWithoutPassword, userForLogin, tokens;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.usersService.findByEmail(registerDto.email)];
                        case 1:
                            existingUser = _b.sent();
                            if (existingUser) {
                                throw new common_1.ConflictException('Email already exists');
                            }
                            tenantId = registerDto.tenantId;
                            if (!!tenantId) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.tenant.findFirst({
                                    where: { domain: 'default' },
                                })];
                        case 2:
                            defaultTenant = _b.sent();
                            if (!!defaultTenant) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.prisma.tenant.create({
                                    data: {
                                        code: 'DEFAULT',
                                        name: registerDto.company || 'Default Company',
                                        domain: 'default',
                                        settings: {},
                                    },
                                })];
                        case 3:
                            tenant = _b.sent();
                            tenantId = tenant.id;
                            return [3 /*break*/, 5];
                        case 4:
                            tenantId = defaultTenant.id;
                            _b.label = 5;
                        case 5: return [4 /*yield*/, bcrypt.hash(registerDto.password, 10)];
                        case 6:
                            passwordHash = _b.sent();
                            return [4 /*yield*/, this.prisma.user.create({
                                    data: {
                                        email: registerDto.email,
                                        passwordHash: passwordHash,
                                        firstName: registerDto.firstName,
                                        lastName: registerDto.lastName,
                                        phone: registerDto.phone,
                                        role: 'CUSTOMER',
                                        tenantId: tenantId,
                                        emailVerified: false,
                                    },
                                })];
                        case 7:
                            user = _b.sent();
                            // Create customer record
                            return [4 /*yield*/, this.prisma.customer.create({
                                    data: {
                                        userId: user.id,
                                        tenantId: tenantId,
                                        company: registerDto.company,
                                        billingAddress: {},
                                        shippingAddress: {},
                                    },
                                })];
                        case 8:
                            // Create customer record
                            _b.sent();
                            _pwd = user.passwordHash, userWithoutPassword = __rest(user, ["passwordHash"]);
                            userForLogin = {
                                id: userWithoutPassword.id,
                                tenantId: userWithoutPassword.tenantId,
                                email: userWithoutPassword.email,
                                name: "".concat(userWithoutPassword.firstName, " ").concat(userWithoutPassword.lastName).trim(),
                                roles: [userWithoutPassword.role.toLowerCase()],
                                active: userWithoutPassword.active,
                                lastLogin: (_a = userWithoutPassword.lastLogin) === null || _a === void 0 ? void 0 : _a.toISOString(),
                            };
                            return [4 /*yield*/, this.login(userForLogin)];
                        case 9:
                            tokens = _b.sent();
                            return [2 /*return*/, __assign(__assign({}, tokens), { user: userForLogin })];
                    }
                });
            });
        };
        AuthService_1.prototype.generateTokens = function (user) {
            return __awaiter(this, void 0, void 0, function () {
                var payload, accessToken, refreshToken;
                return __generator(this, function (_a) {
                    payload = {
                        sub: user.id,
                        email: user.email,
                        tenantId: user.tenantId,
                        roles: user.roles,
                        iat: Math.floor(Date.now() / 1000),
                        exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
                    };
                    accessToken = this.jwtService.sign(payload);
                    refreshToken = this.jwtService.sign(payload, {
                        expiresIn: this.configService.get('jwt.refreshTokenExpiry') || '1d',
                    });
                    return [2 /*return*/, {
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            expiresIn: 15 * 60,
                        }];
                });
            });
        };
        AuthService_1.prototype.hashPassword = function (password) {
            return __awaiter(this, void 0, void 0, function () {
                var saltRounds;
                return __generator(this, function (_a) {
                    saltRounds = 10;
                    return [2 /*return*/, bcrypt.hash(password, saltRounds)];
                });
            });
        };
        return AuthService_1;
    }());
    __setFunctionName(_classThis, "AuthService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
}();
exports.AuthService = AuthService;
