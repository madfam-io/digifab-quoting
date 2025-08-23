import { validateEnv } from './env.validation';

/**
 * Validate environment variables on application startup
 * This should be called as early as possible in the application lifecycle
 */
export function validateEnvironment(): void {
  try {
    console.log('[ENV] Validating environment variables...');
    validateEnv(process.env);
    console.log('[ENV] Environment validation successful');
  } catch (error) {
    console.error('[ENV] Environment validation failed:');
    console.error(error.message);
    process.exit(1);
  }
}
