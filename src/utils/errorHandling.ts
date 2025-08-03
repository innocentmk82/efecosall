export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleFirebaseError = (error: any): string => {
  console.error('Firebase error:', error);
  
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        return 'You do not have permission to perform this action';
      case 'not-found':
        return 'The requested data was not found';
      case 'already-exists':
        return 'This record already exists';
      case 'failed-precondition':
        return 'Operation failed due to invalid conditions';
      case 'unavailable':
        return 'Service is temporarily unavailable. Please try again later';
      case 'deadline-exceeded':
        return 'Request timed out. Please try again';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }
  
  return error.message || 'An unexpected error occurred';
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const message = handleFirebaseError(error);
      throw new AppError(message);
    }
  };
};