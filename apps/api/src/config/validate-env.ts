import { validateEnv } from './env.validation';

/**
 * Validate environment variables on application startup
 * This should be called as early as possible in the application lifecycle
 */
export function validateEnvironment(): void {
  try {
    // eslint-disable-next-line no-console
    console.log('[ENV] Validating environment variables...');
    validateEnv(process.env);
    // eslint-disable-next-line no-console
    console.log('[ENV] Environment validation successful');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ENV] Environment validation failed:');
    const errorMessage = error instanceof Error ? error.message : 'Validation failed';
    // eslint-disable-next-line no-console
    console.error(errorMessage);
    process.exit(1);
  }
}
