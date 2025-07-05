// Base API utility functions and configurations

export const isDevelopment = import.meta.env.VITE_ENV === 'development';
export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
export const RETRY_ATTEMPTS = parseInt(import.meta.env.VITE_RETRY_ATTEMPTS || '3');

export const handleApiError = (error: unknown): never => {
  if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
    console.error('API error:', error);
  }

  // Transform the error into a format that can be handled by the error handlers
  if (error instanceof Error) {
    if ('response' in error) {
      // Preserve the response information
      throw error;
    }
    throw error;
  } else if (typeof error === 'string') {
    throw new Error(error);
  } else if (error && typeof error === 'object') {
    // Handle axios-like error objects
    const axiosError = error as { response?: { status: number; data?: { message?: string } } };
    if (axiosError.response) {
      const newError = new Error(axiosError.response.data?.message || `API error: ${axiosError.response.status}`);
      (newError as any).response = axiosError.response;
      throw newError;
    }
    throw new Error('An unexpected error occurred');
  } else {
    throw new Error('An unexpected error occurred');
  }
};

export const DEFAULT_API_CONFIG = {
  timeout: API_TIMEOUT,
  retries: RETRY_ATTEMPTS,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const CACHE_DURATION = parseInt(import.meta.env.VITE_CACHE_DURATION || '3600');