#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const readline = require('readline');
const path = require('path');

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Utility functions
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`)
};

// Ask user confirmation
async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise((resolve) => {
    rl.question(`${colors.yellow}${question} (y/n): ${colors.reset}`, resolve);
  });
  rl.close();
  
  return answer.toLowerCase() === 'y';
}

// Commands
const commands = {
  reset: async () => {
    log.warning('This will drop and recreate the database, losing all data!');
    
    if (!await confirm('Are you sure you want to reset the database?')) {
      log.info('Database reset cancelled');
      return;
    }
    
    try {
      log.info('Dropping database...');
      await execAsync('cd apps/api && npx prisma migrate reset --force', {
        env: { ...process.env, NODE_ENV: 'development' }
      });
      
      log.success('Database reset successfully');
      
      if (await confirm('Would you like to seed the database?')) {
        await commands.seed();
      }
    } catch (err) {
      log.error(`Failed to reset database: ${err.message}`);
      process.exit(1);
    }
  },
  
  migrate: async () => {
    try {
      log.info('Running database migrations...');
      
      const { stdout } = await execAsync('cd apps/api && npx prisma migrate dev', {
        env: { ...process.env, NODE_ENV: 'development' }
      });
      
      console.log(stdout);
      log.success('Migrations completed successfully');
    } catch (err) {
      log.error(`Migration failed: ${err.message}`);
      process.exit(1);
    }
  },
  
  seed: async () => {
    try {
      log.info('Seeding database...');
      
      await execAsync('cd apps/api && npm run db:seed', {
        env: { ...process.env, NODE_ENV: 'development' }
      });
      
      log.success('Database seeded successfully');
      log.info('Test users created:');
      log.info('  - admin@madfam.io (password: Admin123!)');
      log.info('  - user@example.com (password: User123!)');
    } catch (err) {
      log.error(`Seeding failed: ${err.message}`);
      process.exit(1);
    }
  },
  
  status: async () => {
    try {
      log.info('Checking database status...');
      
      // Check connection
      try {
        await execAsync('cd apps/api && npx prisma db execute --stdin <<< "SELECT 1"', {
          env: { ...process.env, NODE_ENV: 'development' }
        });
        log.success('Database connection: OK');
      } catch (err) {
        log.error('Database connection: FAILED');
        throw err;
      }
      
      // Check migrations
      try {
        const { stdout } = await execAsync('cd apps/api && npx prisma migrate status', {
          env: { ...process.env, NODE_ENV: 'development' }
        });
        
        if (stdout.includes('up to date')) {
          log.success('Migrations: Up to date');
        } else {
          log.warning('Migrations: Pending migrations found');
          console.log(stdout);
        }
      } catch (err) {
        if (err.message.includes('migrations to apply')) {
          log.warning('Migrations: Pending migrations found');
        } else {
          throw err;
        }
      }
      
      // Check table count
      try {
        const { stdout } = await execAsync(`cd apps/api && npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"`, {
          env: { ...process.env, NODE_ENV: 'development' }
        });
        
        const match = stdout.match(/(\d+)/);
        if (match) {
          log.info(`Tables in database: ${match[1]}`);
        }
      } catch (err) {
        // Ignore
      }
      
    } catch (err) {
      log.error(`Status check failed: ${err.message}`);
      process.exit(1);
    }
  },
  
  studio: async () => {
    try {
      log.info('Starting Prisma Studio...');
      log.info('Opening in browser at http://localhost:5555');
      
      const studio = exec('cd apps/api && npx prisma studio', {
        env: { ...process.env, NODE_ENV: 'development' }
      });
      
      studio.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      
      studio.stderr.on('data', (data) => {
        console.error(data.toString());
      });
      
      process.on('SIGINT', () => {
        studio.kill();
        process.exit(0);
      });
      
    } catch (err) {
      log.error(`Failed to start Prisma Studio: ${err.message}`);
      process.exit(1);
    }
  },
  
  backup: async () => {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `backup-${timestamp}.sql`;
      
      log.info(`Creating database backup: ${filename}`);
      
      // Get database name from DATABASE_URL
      const dbUrl = process.env.DATABASE_URL || '';
      const dbName = dbUrl.split('/').pop()?.split('?')[0] || 'madfam_dev';
      
      await execAsync(`pg_dump ${dbName} > ${filename}`);
      
      log.success(`Database backed up to: ${filename}`);
      log.info(`File size: ${(await execAsync(`ls -lh ${filename} | awk '{print $5}'`)).stdout.trim()}`);
    } catch (err) {
      log.error(`Backup failed: ${err.message}`);
      log.info('Make sure pg_dump is installed and DATABASE_URL is set');
      process.exit(1);
    }
  },
  
  restore: async (filename) => {
    if (!filename) {
      log.error('Please provide a backup filename');
      log.info('Usage: npm run db:utils restore <filename>');
      process.exit(1);
    }
    
    log.warning(`This will restore the database from ${filename}, replacing all current data!`);
    
    if (!await confirm('Are you sure you want to restore from backup?')) {
      log.info('Restore cancelled');
      return;
    }
    
    try {
      // Get database name from DATABASE_URL
      const dbUrl = process.env.DATABASE_URL || '';
      const dbName = dbUrl.split('/').pop()?.split('?')[0] || 'madfam_dev';
      
      log.info('Restoring database...');
      await execAsync(`psql ${dbName} < ${filename}`);
      
      log.success('Database restored successfully');
      
      // Update Prisma client
      await execAsync('cd apps/api && npx prisma generate');
      log.success('Prisma client regenerated');
      
    } catch (err) {
      log.error(`Restore failed: ${err.message}`);
      process.exit(1);
    }
  }
};

// Help text
function showHelp() {
  console.log(`
${colors.bright}${colors.blue}MADFAM Database Utilities${colors.reset}

Usage: npm run db:utils <command> [options]

Commands:
  ${colors.cyan}status${colors.reset}    - Check database connection and migration status
  ${colors.cyan}migrate${colors.reset}   - Run pending database migrations
  ${colors.cyan}seed${colors.reset}      - Seed the database with test data
  ${colors.cyan}reset${colors.reset}     - Drop and recreate the database (WARNING: destroys all data)
  ${colors.cyan}studio${colors.reset}    - Open Prisma Studio database GUI
  ${colors.cyan}backup${colors.reset}    - Create a database backup
  ${colors.cyan}restore${colors.reset}   - Restore database from backup file

Examples:
  npm run db:utils status
  npm run db:utils migrate
  npm run db:utils backup
  npm run db:utils restore backup-2024-01-22T10-30-00.sql
`);
}

// Main
async function main() {
  // Load environment
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (err) {
    // Ignore
  }
  
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  if (!commands[command]) {
    log.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
  
  try {
    await commands[command](...args);
  } catch (err) {
    log.error(`Command failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}