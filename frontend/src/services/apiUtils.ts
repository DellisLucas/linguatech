// Base API utility functions and configurations

export const isDevelopment = import.meta.env.VITE_ENV === 'development';
export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
export const RETRY_ATTEMPTS = parseInt(import.meta.env.VITE_RETRY_ATTEMPTS || '3');

// Helper function to handle API errors
export const handleApiError = (error: unknown): never => {
  if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
    console.error('API error:', error);
  }
  throw error;
};

// API request configuration
export const DEFAULT_API_CONFIG = {
  timeout: API_TIMEOUT,
  retries: RETRY_ATTEMPTS,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Cache configuration
export const CACHE_DURATION = parseInt(import.meta.env.VITE_CACHE_DURATION || '3600');