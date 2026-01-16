/**
 * Standardized error codes for the application
 */
export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  
  // Permission errors (403)
  FORBIDDEN = 'FORBIDDEN',
  
  // File upload errors (413)
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  
  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * Application error class with consistent structure
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode | string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // Only set captureStackTrace if available (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Factory functions for common error types
 */

export const notFound = (resource: string) => 
  new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404);

export const validationError = (message: string, details?: unknown) =>
  new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);

export const internalError = (message: string = 'An unexpected error occurred') =>
  new AppError(ErrorCode.INTERNAL_ERROR, message, 500);

export const invalidStatusTransition = (from: string, to: string) =>
  new AppError(
    ErrorCode.INVALID_STATUS_TRANSITION, 
    `Cannot transition from ${from} to ${to}`, 
    400
  );

export const invalidInput = (message: string) =>
  new AppError(ErrorCode.INVALID_INPUT, message, 400);

export const fileTooLarge = (maxSize: string = '5MB') =>
  new AppError(ErrorCode.FILE_TOO_LARGE, `File size exceeds maximum allowed (${maxSize})`, 413);
