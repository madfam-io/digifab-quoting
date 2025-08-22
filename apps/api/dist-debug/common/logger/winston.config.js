"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoggerMiddleware = exports.createWinstonLogger = void 0;
var winston = __importStar(require("winston"));
var nest_winston_1 = require("nest-winston");
var isDevelopment = process.env.NODE_ENV === 'development';
var isProduction = process.env.NODE_ENV === 'production';
// Custom format for JSON logs
var jsonFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json());
// Custom format for console logs in development
var consoleFormat = winston.format.combine(winston.format.timestamp(), winston.format.ms(), winston.format.errors({ stack: true }), nest_winston_1.utilities.format.nestLike('MADFAM', {
    prettyPrint: true,
    colors: true,
}));
// Define log levels
var customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
        verbose: 5,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'blue',
        verbose: 'cyan',
    },
};
// Create Winston logger instance
var createWinstonLogger = function () {
    var transports = [];
    // Console transport
    if (!isProduction || process.env.LOG_TO_CONSOLE === 'true') {
        transports.push(new winston.transports.Console({
            format: isDevelopment ? consoleFormat : jsonFormat,
            level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
        }));
    }
    // File transport for errors
    if (isProduction) {
        transports.push(new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: jsonFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
        }));
        // File transport for all logs
        transports.push(new winston.transports.File({
            filename: 'logs/combined.log',
            format: jsonFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 10,
        }));
    }
    // Create logger
    var logger = winston.createLogger({
        levels: customLevels.levels,
        level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
        format: jsonFormat,
        transports: transports,
        exitOnError: false,
    });
    // Add colors to winston
    winston.addColors(customLevels.colors);
    return logger;
};
exports.createWinstonLogger = createWinstonLogger;
// Logger middleware for Express/NestJS
var createLoggerMiddleware = function (logger) {
    return function (req, res, next) {
        var start = Date.now();
        // Log request
        logger.http('Incoming request', {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
        // Log response
        var originalSend = res.send;
        res.send = function (data) {
            var responseTime = Date.now() - start;
            logger.http('Outgoing response', {
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                responseTime: "".concat(responseTime, "ms"),
            });
            originalSend.call(this, data);
        };
        next();
    };
};
exports.createLoggerMiddleware = createLoggerMiddleware;
