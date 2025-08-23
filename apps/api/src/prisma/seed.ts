import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { code: 'madfam' },
    update: {},
    create: {
      name: 'MADFAM',
      code: 'madfam',
      domain: 'madfam.localhost',
      defaultCurrency: 'MXN',
      supportedCurrencies: ['MXN', 'USD'],
      defaultLocale: 'es',
      supportedLocales: ['es', 'en'],
      features: {
        supplierPortal: false,
        dynamicScheduling: false,
        euRegion: false,
        whatsappNotifications: false,
        bankTransferReconciliation: true,
      },
      settings: {
        quoteValidityDays: 14,
        maxFileSizeMB: 200,
        maxFilesPerQuote: 50,
        autoQuoteTimeoutSeconds: 120,
        dataRetentionDays: {
          quotes: 90,
          orders: 1095, // 3 years
          files: 90,
        },
        marginFloorPercent: 30,
        overheadPercent: 15,
        energyTariffPerKwh: 0.12,
        laborRatePerHour: 25,
        rushUpchargePercent: 50,
      },
      branding: {
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
      },
    },
  });

  console.log(`✅ Created tenant: ${tenant.name}`);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@madfam.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@madfam.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      roles: ['admin'],
      active: true,
      emailVerified: true,
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create materials for 3D printing (FFF)
  const fffMaterials = [
    { code: 'PLA', name: 'PLA', density: 1.24, co2eFactor: 1.6, pricePerUom: 25 },
    { code: 'PETG', name: 'PETG', density: 1.27, co2eFactor: 3.0, pricePerUom: 35 },
    { code: 'ABS', name: 'ABS', density: 1.05, co2eFactor: 3.5, pricePerUom: 30 },
  ];

  for (const mat of fffMaterials) {
    await prisma.material.upsert({
      where: {
        tenantId_code_versionEffectiveFrom: {
          tenantId: tenant.id,
          code: mat.code,
          versionEffectiveFrom: new Date(),
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        process: '3d_fff',
        ...mat,
        costUom: 'kg',
        costPerUnit: mat.pricePerUom,
        recycledPercent: mat.code === 'PLA' ? 30 : 0,
      },
    });
  }

  console.log('✅ Created FFF materials');

  // Create materials for SLA
  await prisma.material.create({
    data: {
      tenantId: tenant.id,
      process: '3d_sla',
      code: 'RESIN_STD',
      name: 'Resin Standard',
      density: 1.15,
      co2eFactor: 6.0,
      costUom: 'l',
      pricePerUom: 80,
      costPerUnit: 80,
    },
  });

  console.log('✅ Created SLA materials');

  // Create materials for CNC
  const cncMaterials = [
    { code: 'AL6061', name: 'Al 6061', density: 2.7, co2eFactor: 10.0, pricePerUom: 5 },
    { code: 'STEEL1018', name: 'Steel 1018', density: 7.87, co2eFactor: 2.1, pricePerUom: 3 },
    { code: 'ACRYLIC', name: 'Acrylic', density: 1.18, co2eFactor: 6.3, pricePerUom: 8 },
  ];

  for (const mat of cncMaterials) {
    await prisma.material.create({
      data: {
        tenantId: tenant.id,
        process: 'cnc_3axis',
        ...mat,
        costUom: 'kg',
        costPerUnit: mat.pricePerUom,
      },
    });
  }

  console.log('✅ Created CNC materials');

  // Create materials for laser cutting
  const laserMaterials = [
    { code: 'ACRYLIC_3MM', name: 'Acrylic 3mm', density: 1.18, co2eFactor: 6.3, pricePerUom: 50 },
    { code: 'MDF_6MM', name: 'MDF 6mm', density: 0.75, co2eFactor: 1.5, pricePerUom: 30 },
    { code: 'PLYWOOD_6MM', name: 'Plywood 6mm', density: 0.65, co2eFactor: 1.2, pricePerUom: 40 },
  ];

  for (const mat of laserMaterials) {
    await prisma.material.create({
      data: {
        tenantId: tenant.id,
        process: 'laser_2d',
        ...mat,
        costUom: 'm2',
        costPerUnit: mat.pricePerUom,
      },
    });
  }

  console.log('✅ Created laser materials');

  // Create machines
  const machines = [
    {
      process: '3d_fff',
      model: 'Prusa MK3S',
      name: 'FFF Printer 1',
      powerW: 120,
      hourlyRate: 15,
      setupMinutes: 10,
      specs: {
        buildVolumeMm: { x: 250, y: 210, z: 210 },
        resolution: 0.05,
      },
    },
    {
      process: '3d_sla',
      model: 'Form 3',
      name: 'SLA Printer 1',
      powerW: 65,
      hourlyRate: 25,
      setupMinutes: 15,
      specs: {
        buildVolumeMm: { x: 145, y: 145, z: 185 },
        resolution: 0.025,
      },
    },
    {
      process: 'cnc_3axis',
      model: 'HAAS VF-2',
      name: 'CNC Mill 1',
      powerW: 15000,
      hourlyRate: 80,
      setupMinutes: 30,
      specs: {
        buildVolumeMm: { x: 762, y: 406, z: 508 },
        spindleRPM: 8100,
      },
    },
    {
      process: 'laser_2d',
      model: 'Epilog Fusion Pro',
      name: 'Laser Cutter 1',
      powerW: 120,
      hourlyRate: 40,
      setupMinutes: 10,
      specs: {
        bedSizeMm: { x: 1219, y: 914 },
        laserPowerW: 120,
      },
    },
  ];

  for (const machine of machines) {
    await prisma.machine.create({
      data: {
        tenantId: tenant.id,
        ...machine,
      },
    });
  }

  console.log('✅ Created machines');

  // Create process options
  const processOptions = [
    {
      process: '3d_fff',
      marginFloorPercent: 30,
      optionsSchema: {
        material: { type: 'string', required: true },
        layerHeight: { type: 'number', enum: [0.1, 0.15, 0.2, 0.3] },
        infill: { type: 'number', min: 10, max: 100, step: 5 },
        supportMaterial: { type: 'boolean' },
        finish: { type: 'string', enum: ['standard', 'smooth'] },
      },
    },
    {
      process: '3d_sla',
      marginFloorPercent: 35,
      optionsSchema: {
        material: { type: 'string', required: true },
        layerHeight: { type: 'number', enum: [0.025, 0.05, 0.1] },
        finish: { type: 'string', enum: ['standard', 'smooth', 'clear'] },
      },
    },
    {
      process: 'cnc_3axis',
      marginFloorPercent: 40,
      optionsSchema: {
        material: { type: 'string', required: true },
        tolerance: { type: 'string', enum: ['standard', 'tight', 'loose'] },
        finish: { type: 'string', enum: ['machined', 'smooth', 'polished'] },
        threads: { type: 'boolean' },
      },
    },
    {
      process: 'laser_2d',
      marginFloorPercent: 25,
      optionsSchema: {
        material: { type: 'string', required: true },
        materialThickness: { type: 'number', required: true },
        engraving: { type: 'boolean' },
        finish: { type: 'string', enum: ['standard', 'polished_edges'] },
      },
    },
  ];

  for (const option of processOptions) {
    await prisma.processOption.create({
      data: {
        tenantId: tenant.id,
        ...option,
      },
    });
  }

  console.log('✅ Created process options');

  // Create discount rules
  await prisma.discountRule.create({
    data: {
      tenantId: tenant.id,
      name: 'Volume Discount',
      scope: 'quote',
      formula: 'percentage',
      thresholds: [
        { min: 10, percent: 5 },
        { min: 50, percent: 10 },
        { min: 100, percent: 15 },
        { min: 500, percent: 20 },
      ],
    },
  });

  console.log('✅ Created discount rules');

  // Create FX rates
  await prisma.fXRate.create({
    data: {
      base: 'USD',
      quote: 'MXN',
      rate: 17.5,
      asOf: new Date(),
      source: 'manual',
    },
  });

  console.log('✅ Created FX rates');

  console.log('✨ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
