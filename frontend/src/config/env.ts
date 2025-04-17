import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_NAME: z.string(),
  VITE_ENV: z.enum(['development', 'production', 'staging']),
  VITE_ENABLE_MOCK_API: z.string().transform(val => val === 'true'),
  VITE_ENABLE_DEBUG_MODE: z.string().transform(val => val === 'true'),
  VITE_TOKEN_EXPIRY: z.string().transform(Number),
  VITE_AUTH_STORAGE_KEY: z.string(),
  VITE_DEFAULT_THEME: z.enum(['light', 'dark']),
  VITE_TOAST_DURATION: z.string().transform(Number),
  VITE_MAX_QUIZ_QUESTIONS: z.string().transform(Number),
  VITE_API_TIMEOUT: z.string().transform(Number),
  VITE_RETRY_ATTEMPTS: z.string().transform(Number),
  VITE_CACHE_DURATION: z.string().transform(Number),
});

export const validateEnv = () => {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('Invalid environment variables:', error);
    throw new Error('Invalid environment variables');
  }
};

const env = validateEnv();

export default env;