import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  // File type validation mapping - currently unused but kept for future validation
  // private readonly fileTypeMap: Record<string, string[]> = {
  //   'model/stl': ['STL', 'ASCII', 'solid'],
  //   'model/step': ['ISO-10303-21', 'STEP'],
  //   'model/iges': ['IGES', '5.3'],
  //   'application/dxf': ['AutoCAD', 'DXF'],
  // };

  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize all string inputs
    this.sanitizeObject(req.body);
    this.sanitizeObject(req.query);
    this.sanitizeObject(req.params);

    // Validate file uploads if present
    if ('files' in req && req.files) {
      this.validateFiles(req.files as Express.Multer.File[] | Express.Multer.File);
    }

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    next();
  }

  private sanitizeObject(obj: Record<string, unknown> | null | undefined): void {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        const strValue = obj[key] as string;
        // Basic sanitization
        obj[key] = strValue.trim();
        
        // HTML sanitization for fields that might contain HTML
        if (this.isHtmlField(key)) {
          obj[key] = DOMPurify.sanitize(strValue, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
            ALLOWED_ATTR: ['href', 'target'],
          });
        }
        
        // Remove any potential SQL injection attempts
        obj[key] = this.sanitizeSql(obj[key]);
        
        // Remove any potential NoSQL injection attempts
        obj[key] = this.sanitizeNoSql(obj[key]);
      } else if (typeof obj[key] === 'object') {
        this.sanitizeObject(obj[key] as Record<string, unknown>);
      }
    }
  }

  private isHtmlField(fieldName: string): boolean {
    const htmlFields = ['description', 'notes', 'comments', 'message'];
    return htmlFields.some(field => fieldName.toLowerCase().includes(field));
  }

  private sanitizeSql(input: unknown): string {
    if (typeof input !== 'string') return String(input);
    
    // Remove common SQL injection patterns
    const sqlPatterns = [
      /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)\b)/gi,
      /(--)/g,
      /(\/\*[\s\S]*?\*\/)/g,
      /(;)/g,
      /(\|\|)/g,
    ];

    let sanitized = input;
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  }

  private sanitizeNoSql(input: unknown): string {
    if (typeof input !== 'string') return String(input);
    
    // Remove MongoDB injection patterns
    const noSqlPatterns = [
      /(\$[a-zA-Z]+)/g, // $ne, $gt, etc.
      /({|})/g,
      /(\[|\])/g,
    ];

    let sanitized = input;
    noSqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  }

  private validateFiles(files: Express.Multer.File[] | Express.Multer.File): void {
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const allowedExtensions = ['.stl', '.step', '.stp', '.iges', '.igs', '.dxf'];

    const fileArray = Array.isArray(files) ? files : [files];

    fileArray.forEach((file: Express.Multer.File) => {
      // Check file size
      if (file.size > maxFileSize) {
        throw new BadRequestException(`File ${file.originalname} exceeds maximum size of 50MB`);
      }

      // Check file extension
      const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
      if (!allowedExtensions.includes(extension)) {
        throw new BadRequestException(`File type ${extension} is not allowed`);
      }

      // Check MIME type
      const validMimeTypes = ['model/stl', 'model/step', 'model/iges', 'application/dxf', 'application/octet-stream'];
      if (!validMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`MIME type ${file.mimetype} is not allowed`);
      }

      // TODO: Add magic number validation for file content
    });
  }
}

// Global validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const createValidationPipe = <T>(schema: z.ZodSchema<T>) => {
  return (value: unknown): T => {
    try {
      return schema.parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw error;
    }
  };
};