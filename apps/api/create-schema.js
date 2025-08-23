#!/usr/bin/env node

const { execSync } = require('child_process');

async function createSchema() {
  console.log('Creating database schema...');

  try {
    // Use Node.js to run Prisma commands directly
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema created successfully!');

    // Generate Prisma client
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully!');
  } catch (error) {
    console.error('❌ Error creating schema:', error.message);
    process.exit(1);
  }
}

createSchema();
