"use strict";
/**
 * Error handling utilities with proper TypeScript types
 */
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
exports.isError = isError;
exports.hasMessage = hasMessage;
exports.hasStack = hasStack;
exports.getErrorMessage = getErrorMessage;
exports.getErrorStack = getErrorStack;
exports.toError = toError;
exports.enhanceError = enhanceError;
exports.formatErrorForLogging = formatErrorForLogging;
/**
 * Type guard to check if a value is an Error object
 */
function isError(error) {
    return error instanceof Error;
}
/**
 * Type guard to check if error has a message property
 */
function hasMessage(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string');
}
/**
 * Type guard to check if error has a stack property
 */
function hasStack(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'stack' in error &&
        typeof error.stack === 'string');
}
/**
 * Safely extract error message from unknown error type
 */
function getErrorMessage(error) {
    if (isError(error)) {
        return error.message;
    }
    if (hasMessage(error)) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unknown error occurred';
}
/**
 * Safely extract error stack from unknown error type
 */
function getErrorStack(error) {
    if (isError(error)) {
        return error.stack;
    }
    if (hasStack(error)) {
        return error.stack;
    }
    return undefined;
}
/**
 * Convert unknown error to Error object
 */
function toError(error) {
    if (isError(error)) {
        return error;
    }
    var message = getErrorMessage(error);
    var err = new Error(message);
    // Preserve original stack if available
    var stack = getErrorStack(error);
    if (stack) {
        err.stack = stack;
    }
    return err;
}
/**
 * Enhance error with metadata
 */
function enhanceError(error, metadata) {
    var err = toError(error);
    if (metadata) {
        var code = metadata.code, statusCode = metadata.statusCode, rest = __rest(metadata, ["code", "statusCode"]);
        err.code = code;
        err.statusCode = statusCode;
        err.metadata = rest;
    }
    return err;
}
function formatErrorForLogging(error) {
    var err = toError(error);
    return {
        message: err.message,
        stack: err.stack,
        code: err.code,
        statusCode: err.statusCode,
        metadata: err.metadata,
    };
}
