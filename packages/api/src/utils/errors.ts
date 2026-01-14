export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (resource: string) => 
  new AppError('NOT_FOUND', `${resource} not found`, 404);

export const validationError = (message: string, details?: any) =>
  new AppError('VALIDATION_ERROR', message, 400);

export const internalError = (message: string = 'An unexpected error occurred') =>
  new AppError('INTERNAL_ERROR', message, 500);

export const invalidStatusTransition = (from: string, to: string) =>
  new AppError('INVALID_STATUS_TRANSITION', `Cannot transition from ${from} to ${to}`, 400);
