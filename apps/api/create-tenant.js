#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function createDefaultTenant() {
  const prisma = new PrismaClient();

  console.log('Creating default tenant...');

  try {
    // Check if default tenant already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: { code: 'default' },
    });

    if (existingTenant) {
      console.log('✅ Default tenant already exists:', existingTenant.id);
      return;
    }

    // Create default tenant
    const defaultTenant = await prisma.tenant.create({
      data: {
        name: 'Cotiza Studio Default',
        code: 'default',
        domain: 'localhost',
        defaultCurrency: 'MXN',
        supportedCurrencies: ['MXN', 'USD'],
        defaultLocale: 'es',
        supportedLocales: ['es', 'en'],
        features: {},
        settings: {},
        branding: {},
        active: true,
      },
    });

    console.log('✅ Default tenant created successfully:', defaultTenant.id);
  } catch (error) {
    console.error('❌ Error creating tenant:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultTenant();
