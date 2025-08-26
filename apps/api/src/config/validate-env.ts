import { validateEnv } from './env.validation';

/**
 * Validate environment variables on application startup
 * This should be called as early as possible in the application lifecycle
 */
export function validateEnvironment(): void {
  try {
    // Use process.stdout for initialization logging (before logger is available)
    process.stdout.write('[ENV] Validating environment variables...\n');
    validateEnv(process.env);
    process.stdout.write('[ENV] Environment validation successful\n');
  } catch (error) {
    process.stderr.write('[ENV] Environment validation failed:\n');
    const errorMessage = error instanceof Error ? error.message : 'Validation failed';
    process.stderr.write(`${errorMessage}\n`);
    process.exit(1);
  }
}
