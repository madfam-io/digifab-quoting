import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import DOMPurify from 'isomorphic-dompurify';

// Use isomorphic-dompurify which handles server-side automatically
const purify = DOMPurify;

// SQL Injection prevention patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)/gi,
  /(--|\||\*|;|\/\*|\*\/|xp_|sp_|0x|@@|@)/gi,
  /(\b(AND|OR)\b\s*\(?\s*\w+\s*=\s*\w+)/gi,
];

// NoSQL Injection prevention patterns
const NOSQL_INJECTION_PATTERNS = [
  /(\$where|\$ne|\$eq|\$gt|\$gte|\$lt|\$lte|\$in|\$nin|\$exists|\$regex)/gi,
  /{.*}/,
  /\[.*\]/,
];

// XSS prevention patterns - future enhancement
// const XSS_PATTERNS = [
//   /<script[^>]*>.*?<\/script>/gi,
//   /javascript:/gi,
//   /on\w+\s*=/gi,
//   /<iframe[^>]*>.*?<\/iframe>/gi,
//   /<object[^>]*>.*?<\/object>/gi,
//   /<embed[^>]*>/gi,
// ];

// Path traversal prevention
const PATH_TRAVERSAL_PATTERNS = [/\.\./g, /\.\.%2F/gi, /\.\.%5C/gi, /%2e%2e/gi, /\.\//g];

export class SecurityValidator {
  /**
   * Sanitize string input to prevent XSS
   */
  static sanitizeHtml(value: string): string {
    if (!value || typeof value !== 'string') return value;

    // Use DOMPurify for HTML sanitization
    return purify.sanitize(value, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
      ALLOWED_ATTR: ['href'],
      ALLOW_DATA_ATTR: false,
    });
  }

  /**
   * Validate and sanitize input against SQL injection
   */
  static validateSQLInjection(value: string): string {
    if (!value || typeof value !== 'string') return value;

    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        throw new BadRequestException('Invalid input detected');
      }
    }

    return value;
  }

  /**
   * Validate and sanitize input against NoSQL injection
   */
  static validateNoSQLInjection(value: any): any {
    if (typeof value === 'string') {
      for (const pattern of NOSQL_INJECTION_PATTERNS) {
        if (pattern.test(value)) {
          throw new BadRequestException('Invalid input detected');
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      // Check for dangerous MongoDB operators
      const dangerous = Object.keys(value).some((key) => key.startsWith('$'));
      if (dangerous) {
        throw new BadRequestException('Invalid input detected');
      }
    }

    return value;
  }

  /**
   * Validate file paths to prevent directory traversal
   */
  static validatePath(value: string): string {
    if (!value || typeof value !== 'string') return value;

    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(value)) {
        throw new BadRequestException('Invalid file path');
      }
    }

    // Additional checks
    if (value.includes('\0') || value.includes('%00')) {
      throw new BadRequestException('Invalid file path');
    }

    return value;
  }

  /**
   * Sanitize filename for safe storage
   */
  static sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') return '';

    // Remove path components
    filename = filename.replace(/^.*[\\\/]/, '');

    // Remove special characters except dots, dashes, and underscores
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Prevent double extensions
    filename = filename.replace(/\.{2,}/g, '.');

    // Limit length
    if (filename.length > 255) {
      const ext = filename.split('.').pop();
      filename = filename.substring(0, 250) + '.' + ext;
    }

    return filename;
  }

  /**
   * Validate email with strict pattern
   */
  static validateEmail(email: string): string {
    if (!email || typeof email !== 'string') return email;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Additional validation
    if (email.length > 254) {
      throw new BadRequestException('Email too long');
    }

    return email.toLowerCase().trim();
  }

  /**
   * Validate and sanitize JSON input
   */
  static sanitizeJSON(value: any): any {
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {
        throw new BadRequestException('Invalid JSON format');
      }
    }

    // Deep sanitization of JSON object
    if (typeof value === 'object' && value !== null) {
      return this.deepSanitizeObject(value);
    }

    return value;
  }

  private static deepSanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepSanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Validate key
        if (key.startsWith('$') || key.includes('__proto__')) {
          continue; // Skip dangerous keys
        }

        // Recursively sanitize value
        sanitized[key] = this.deepSanitizeObject(value);
      }
      return sanitized;
    }

    if (typeof obj === 'string') {
      return this.sanitizeHtml(obj);
    }

    return obj;
  }
}

// Transform decorators for class-validator
export function SanitizeHtml() {
  return Transform(({ value }) => SecurityValidator.sanitizeHtml(value));
}

export function ValidateSQLSafe() {
  return Transform(({ value }) => SecurityValidator.validateSQLInjection(value));
}

export function ValidateNoSQLSafe() {
  return Transform(({ value }) => SecurityValidator.validateNoSQLInjection(value));
}

export function SanitizePath() {
  return Transform(({ value }) => SecurityValidator.validatePath(value));
}

export function SanitizeFilename() {
  return Transform(({ value }) => SecurityValidator.sanitizeFilename(value));
}

export function SanitizeEmail() {
  return Transform(({ value }) => SecurityValidator.validateEmail(value));
}

export function SanitizeJSON() {
  return Transform(({ value }) => SecurityValidator.sanitizeJSON(value));
}
