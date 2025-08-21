/**
 * Error handling utilities with proper TypeScript types
 */

/**
 * Type guard to check if a value is an Error object
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if error has a message property
 */
export function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Type guard to check if error has a stack property
 */
export function hasStack(error: unknown): error is { stack: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'stack' in error &&
    typeof (error as any).stack === 'string'
  );
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
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
export function getErrorStack(error: unknown): string | undefined {
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
export function toError(error: unknown): Error {
  if (isError(error)) {
    return error;
  }
  
  const message = getErrorMessage(error);
  const err = new Error(message);
  
  // Preserve original stack if available
  const stack = getErrorStack(error);
  if (stack) {
    err.stack = stack;
  }
  
  return err;
}

/**
 * Create a standardized error object with metadata
 */
export interface ErrorWithMetadata extends Error {
  code?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

/**
 * Enhance error with metadata
 */
export function enhanceError(
  error: unknown,
  metadata?: {
    code?: string;
    statusCode?: number;
    [key: string]: any;
  }
): ErrorWithMetadata {
  const err = toError(error) as ErrorWithMetadata;
  
  if (metadata) {
    const { code, statusCode, ...rest } = metadata;
    err.code = code;
    err.statusCode = statusCode;
    err.metadata = rest;
  }
  
  return err;
}

/**
 * Format error for logging
 */
export interface FormattedError {
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

export function formatErrorForLogging(error: unknown): FormattedError {
  const err = toError(error) as ErrorWithMetadata;
  
  return {
    message: err.message,
    stack: err.stack,
    code: err.code,
    statusCode: err.statusCode,
    metadata: err.metadata,
  };
}