#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');
const fs = require('fs').promises;
const readline = require('readline');

// Configuration
const CONFIG = {
  ports: {
    api: 4000,
    web: 3002,
    redis: 6379,
    postgres: 5432,
  },
  services: {
    postgres: {
      name: 'PostgreSQL',
      checkCommand: 'nc -z localhost 5432',
      startCommand: 'brew services start postgresql@15 || brew services start postgresql',
      installCommand: 'brew install postgresql@15',
      required: true,
    },
    redis: {
      name: 'Redis',
      checkCommand: 'redis-cli ping',
      startCommand: 'brew services start redis',
      installCommand: 'brew install redis',
      required: true,
    },
  },
  timeout: {
    serviceStart: 30000, // 30 seconds
    healthCheck: 5000, // 5 seconds
    gracefulShutdown: 10000, // 10 seconds
  },
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Utility functions
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.magenta}[STEP]${colors.reset} ${msg}`),
  debug: (msg) => process.env.DEBUG && console.log(`${colors.cyan}[DEBUG]${colors.reset} ${msg}`),
};

// Process tracking
let runningProcesses = [];
let isShuttingDown = false;

// Graceful shutdown handler
async function gracefulShutdown(signal = 'SIGTERM') {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log.info(`\n${colors.yellow}Received ${signal}, shutting down gracefully...${colors.reset}`);

  // Kill all child processes
  for (const proc of runningProcesses) {
    try {
      if (!proc.killed) {
        log.info(`Stopping ${proc.name}...`);
        proc.kill('SIGTERM');

        // Wait for process to exit or force kill after timeout
        const timeout = setTimeout(() => {
          if (!proc.killed) {
            log.warning(`Force killing ${proc.name}...`);
            proc.kill('SIGKILL');
          }
        }, CONFIG.timeout.gracefulShutdown);

        await new Promise((resolve) => {
          proc.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }
    } catch (err) {
      log.error(`Error stopping ${proc.name}: ${err.message}`);
    }
  }

  log.success('All processes stopped. Goodbye!');
  process.exit(0);
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart

// Check if port is in use
async function isPortInUse(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    return stdout.trim().length > 0;
  } catch (err) {
    return false;
  }
}

// Kill processes on port
async function killPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    const pids = stdout.trim().split('\n').filter(Boolean);

    for (const pid of pids) {
      try {
        await execAsync(`kill -9 ${pid}`);
        log.success(`Killed process ${pid} on port ${port}`);
      } catch (err) {
        log.debug(`Failed to kill process ${pid}: ${err.message}`);
      }
    }

    // Wait a bit for ports to be released
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (err) {
    log.debug(`No processes found on port ${port}`);
  }
}

// Check if a service is running
async function checkService(service) {
  try {
    await execAsync(service.checkCommand);
    return true;
  } catch (err) {
    return false;
  }
}

// Start a service
async function startService(service) {
  log.info(`Starting ${service.name}...`);

  try {
    await execAsync(service.startCommand);

    // Wait for service to be ready
    const startTime = Date.now();
    while (Date.now() - startTime < CONFIG.timeout.serviceStart) {
      if (await checkService(service)) {
        log.success(`${service.name} is running`);
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error(`${service.name} failed to start within timeout`);
  } catch (err) {
    log.error(`Failed to start ${service.name}: ${err.message}`);

    if (err.message.includes('command not found') || err.message.includes('No such file')) {
      log.warning(`${service.name} is not installed`);
      log.info(
        `To install ${service.name}, run: ${colors.cyan}${service.installCommand}${colors.reset}`,
      );
    }

    return false;
  }
}

// Check and start required services
async function checkRequiredServices() {
  log.step('Checking required services...');

  for (const [key, service] of Object.entries(CONFIG.services)) {
    if (!service.required) continue;

    if (await checkService(service)) {
      log.success(`${service.name} is already running`);
    } else {
      const started = await startService(service);
      if (!started) {
        throw new Error(`Required service ${service.name} is not available`);
      }
    }
  }
}

// Check Node.js version
async function checkNodeVersion() {
  log.step('Checking Node.js version...');

  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

  if (majorVersion < 18) {
    throw new Error(`Node.js 18.0.0 or higher is required. Current version: ${nodeVersion}`);
  }

  log.success(`Node.js version ${nodeVersion} meets requirements`);
}

// Check and install dependencies
async function checkDependencies() {
  log.step('Checking dependencies...');

  // Check if node_modules exists
  try {
    await fs.access(path.join(process.cwd(), 'node_modules'));
    log.success('Dependencies are installed');
  } catch (err) {
    log.warning('Dependencies not found, installing...');

    try {
      await execAsync('npm install', {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
      log.success('Dependencies installed successfully');
    } catch (err) {
      throw new Error(`Failed to install dependencies: ${err.message}`);
    }
  }
}

// Check database connection and schema
async function checkDatabase() {
  log.step('Checking database connection and schema...');

  try {
    // Check if we can connect to the database
    const { stdout } = await execAsync('npm run db:generate', {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'development' },
    });

    log.success('Database connection successful');

    // Check if migrations are up to date
    try {
      await execAsync('cd apps/api && npx prisma migrate status', {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: 'development' },
      });
      log.success('Database schema is up to date');
    } catch (err) {
      if (err.message.includes('migrations to apply')) {
        log.warning('Database migrations are pending');

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const answer = await new Promise((resolve) => {
          rl.question(
            `${colors.yellow}Would you like to run migrations now? (y/n): ${colors.reset}`,
            resolve,
          );
        });
        rl.close();

        if (answer.toLowerCase() === 'y') {
          log.info('Running database migrations...');
          await execAsync('npm run db:migrate', {
            cwd: process.cwd(),
            stdio: 'inherit',
          });
          log.success('Database migrations completed');
        } else {
          log.warning('Skipping migrations. The application may not work correctly.');
        }
      }
    }
  } catch (err) {
    throw new Error(`Database check failed: ${err.message}`);
  }
}

// Check and clear ports
async function checkAndClearPorts() {
  log.step('Checking and clearing ports...');

  for (const [service, port] of Object.entries(CONFIG.ports)) {
    if (await isPortInUse(port)) {
      // Don't kill PostgreSQL and Redis ports since they're infrastructure services
      if (service === 'postgres' || service === 'redis') {
        log.success(`Port ${port} (${service}) is in use by infrastructure service`);
      } else {
        log.warning(`Port ${port} (${service}) is in use`);
        await killPort(port);
      }
    } else {
      log.success(`Port ${port} (${service}) is available`);
    }
  }
}

// Load environment variables
async function loadEnvironment() {
  log.step('Loading environment variables...');

  const envFiles = ['.env.local', '.env.development', '.env'];

  for (const envFile of envFiles) {
    try {
      const envPath = path.join(process.cwd(), envFile);
      await fs.access(envPath);
      log.success(`Found ${envFile}`);

      // Load env vars
      try {
        require('dotenv').config({ path: envPath });
      } catch (err) {
        // dotenv might not be installed, that's ok
        log.debug('dotenv not available, skipping .env file loading');
      }
      break;
    } catch (err) {
      log.debug(`${envFile} not found`);
    }
  }

  // Check required environment variables
  const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET'];

  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    log.warning(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    log.info('Some features may not work correctly');
  }
}

// Spawn a process with logging
function spawnProcess(name, command, args, options = {}) {
  log.info(`Starting ${name}...`);

  const proc = spawn(command, args, {
    stdio: 'pipe',
    shell: true,
    ...options,
  });

  proc.name = name;

  // Handle stdout
  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    lines.forEach((line) => {
      console.log(`${colors.cyan}[${name}]${colors.reset} ${line}`);
    });
  });

  // Handle stderr
  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    lines.forEach((line) => {
      // Filter out common warnings
      if (
        !line.includes('ExperimentalWarning') &&
        !line.includes('punycode') &&
        !line.includes('DEP0040')
      ) {
        console.error(`${colors.red}[${name}]${colors.reset} ${line}`);
      }
    });
  });

  // Handle process exit
  proc.on('exit', (code, signal) => {
    if (code !== 0 && !isShuttingDown) {
      log.error(`${name} exited with code ${code} (signal: ${signal})`);
    }

    // Remove from running processes
    runningProcesses = runningProcesses.filter((p) => p !== proc);

    // Restart if not shutting down and it crashed
    if (!isShuttingDown && code !== 0) {
      log.warning(`Restarting ${name} in 5 seconds...`);
      setTimeout(() => {
        if (!isShuttingDown) {
          const newProc = spawnProcess(name, command, args, options);
          runningProcesses.push(newProc);
        }
      }, 5000);
    }
  });

  proc.on('error', (err) => {
    log.error(`Failed to start ${name}: ${err.message}`);
  });

  return proc;
}

// Start all services
async function startServices() {
  log.step('Starting application services...');

  // Start turbo dev command
  const turboProc = spawnProcess('turbo', 'npm', ['run', 'dev:raw'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      FORCE_COLOR: '1',
    },
  });

  runningProcesses.push(turboProc);

  // Wait a bit for services to start
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Check if services are responding
  const healthCheck = async () => {
    try {
      const apiCheck = execAsync('curl -s http://localhost:4000/api/v1/health');
      const webCheck = execAsync('curl -s http://localhost:3002');

      await Promise.race([
        Promise.all([apiCheck, webCheck]),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), CONFIG.timeout.healthCheck),
        ),
      ]);

      return true;
    } catch (err) {
      return false;
    }
  };

  // Wait for services to be healthy
  log.info('Waiting for services to be ready...');
  const startTime = Date.now();

  while (Date.now() - startTime < 30000) {
    if (await healthCheck()) {
      log.success('All services are ready!');
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  log.success(
    `\n${colors.bright}${colors.green}Development environment is ready!${colors.reset}\n`,
  );
  log.info(`API Server: ${colors.cyan}http://localhost:4000${colors.reset}`);
  log.info(`Web App: ${colors.cyan}http://localhost:3002${colors.reset}`);
  log.info(`API Docs: ${colors.cyan}http://localhost:4000/api${colors.reset}\n`);
  log.info(`Press ${colors.yellow}Ctrl+C${colors.reset} to stop all services\n`);
}

// Main orchestration function
async function main() {
  console.log(
    `\n${colors.bright}${colors.blue}Cotiza Studio Development Environment Orchestrator${colors.reset}\n`,
  );

  try {
    // Run all checks
    await checkNodeVersion();
    await checkRequiredServices();
    await loadEnvironment();
    await checkDependencies();
    await checkDatabase();
    await checkAndClearPorts();

    // Start services
    await startServices();
  } catch (err) {
    log.error(`\n${colors.bright}Failed to start development environment${colors.reset}`);
    log.error(err.message);

    // Provide helpful error messages
    if (err.message.includes('PostgreSQL')) {
      log.info('\nTo fix PostgreSQL issues:');
      log.info('1. Install PostgreSQL: brew install postgresql@15');
      log.info('2. Start PostgreSQL: brew services start postgresql@15');
      log.info('3. Create database: createdb madfam_quoting');
    } else if (err.message.includes('Redis')) {
      log.info('\nTo fix Redis issues:');
      log.info('1. Install Redis: brew install redis');
      log.info('2. Start Redis: brew services start redis');
    } else if (err.message.includes('DATABASE_URL')) {
      log.info('\nTo fix database connection:');
      log.info('1. Create a .env file in the project root');
      log.info('2. Add: DATABASE_URL="postgresql://user:password@localhost:5432/madfam_dev"');
      log.info('3. Replace user and password with your PostgreSQL credentials');
    }

    await gracefulShutdown('ERROR');
  }
}

// Run the orchestrator
if (require.main === module) {
  main();
}

module.exports = { main, gracefulShutdown };
