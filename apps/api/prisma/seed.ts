import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'default' },
    update: {},
    create: {
      code: 'DEFAULT',
      name: 'Default Tenant',
      domain: 'default',
      settings: {
        currency: 'MXN',
        locale: 'es',
      },
    },
  });

  console.log(`Created tenant: ${tenant.name}`);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@madfam.io' },
    update: {},
    create: {
      email: 'admin@madfam.io',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      tenantId: tenant.id,
      emailVerified: true,
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);

  // Create test customer
  const customerPassword = await bcrypt.hash('test123', 10);
  const customerUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: customerPassword,
      firstName: 'Test',
      lastName: 'Customer',
      role: 'CUSTOMER',
      tenantId: tenant.id,
      emailVerified: true,
    },
  });

  await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      tenantId: tenant.id,
      company: 'Test Company',
      billingAddress: {
        street: '123 Main St',
        city: 'Mexico City',
        state: 'CDMX',
        postalCode: '12345',
        country: 'MX',
      },
      shippingAddress: {
        street: '123 Main St',
        city: 'Mexico City',
        state: 'CDMX',
        postalCode: '12345',
        country: 'MX',
      },
    },
  });

  console.log(`Created test customer: ${customerUser.email}`);

  // Create materials
  const materials = [
    // FFF Materials
    { code: 'PLA-STD', name: 'PLA Standard', process: 'FFF', density: 1.24, costPerUnit: 25, color: 'white' },
    { code: 'ABS-STD', name: 'ABS', process: 'FFF', density: 1.04, costPerUnit: 30, color: 'white' },
    { code: 'PETG-STD', name: 'PETG', process: 'FFF', density: 1.27, costPerUnit: 35, color: 'clear' },
    { code: 'TPU-95A', name: 'TPU 95A', process: 'FFF', density: 1.21, costPerUnit: 45, color: 'black' },
    { code: 'NYLON-STD', name: 'Nylon', process: 'FFF', density: 1.14, costPerUnit: 50, color: 'white' },
    
    // SLA Materials
    { code: 'RESIN-STD', name: 'Standard Resin', process: 'SLA', density: 1.18, costPerUnit: 80, color: 'grey' },
    { code: 'RESIN-TOUGH', name: 'Tough Resin', process: 'SLA', density: 1.20, costPerUnit: 120, color: 'grey' },
    { code: 'RESIN-FLEX', name: 'Flexible Resin', process: 'SLA', density: 1.15, costPerUnit: 150, color: 'black' },
    
    // CNC Materials
    { code: 'AL-6061', name: 'Aluminum 6061', process: 'CNC_3AXIS', density: 2.70, costPerUnit: 50, color: 'silver' },
    { code: 'STEEL-1018', name: 'Steel 1018', process: 'CNC_3AXIS', density: 7.87, costPerUnit: 40, color: 'silver' },
    { code: 'SS-304', name: 'Stainless Steel 304', process: 'CNC_3AXIS', density: 8.00, costPerUnit: 60, color: 'silver' },
    { code: 'POM-STD', name: 'Delrin (POM)', process: 'CNC_3AXIS', density: 1.41, costPerUnit: 35, color: 'white' },
    { code: 'NYLON-6', name: 'Nylon 6', process: 'CNC_3AXIS', density: 1.14, costPerUnit: 30, color: 'white' },
    
    // Laser Materials
    { code: 'ACRYLIC-3MM', name: 'Acrylic 3mm', process: 'LASER_2D', density: 1.19, costPerUnit: 15, color: 'clear' },
    { code: 'PLYWOOD-3MM', name: 'Plywood 3mm', process: 'LASER_2D', density: 0.60, costPerUnit: 10, color: 'natural' },
    { code: 'MDF-3MM', name: 'MDF 3mm', process: 'LASER_2D', density: 0.75, costPerUnit: 8, color: 'natural' },
  ];

  for (const material of materials) {
    const { color, costPerUnit, ...materialData } = material;
    await prisma.material.create({
      data: {
        code: materialData.code,
        name: materialData.name,
        process: materialData.process,
        density: materialData.density,
        tenantId: tenant.id,
        co2eFactor: 2.5, // Default value
        costUom: 'kg',
        pricePerUom: costPerUnit,
        costPerUnit: costPerUnit,
        costPerKg: costPerUnit, // Add costPerKg field
        properties: {
          color: color,
        },
      },
    });
  }

  console.log(`Created ${materials.length} materials`);

  // Create machines
  const machines = [
    // FFF Machines
    { name: 'Prusa MK3S+', model: 'MK3S+', process: 'FFF', buildVolume: { x: 250, y: 210, z: 210 }, hourlyRate: 500 },
    { name: 'Ultimaker S5', model: 'S5', process: 'FFF', buildVolume: { x: 330, y: 240, z: 300 }, hourlyRate: 600 },
    
    // SLA Machines
    { name: 'Form 3', model: 'Form 3', process: 'SLA', buildVolume: { x: 145, y: 145, z: 185 }, hourlyRate: 800 },
    
    // CNC Machines
    { name: 'Haas VF-2', model: 'VF-2', process: 'CNC_3AXIS', buildVolume: { x: 762, y: 406, z: 508 }, hourlyRate: 1500 },
    { name: 'Tormach 1100M', model: '1100M', process: 'CNC_3AXIS', buildVolume: { x: 457, y: 254, z: 406 }, hourlyRate: 1200 },
    
    // Laser Machines
    { name: 'Epilog Fusion Pro 48', model: 'Fusion Pro 48', process: 'LASER_2D', buildVolume: { x: 1219, y: 914, z: 311 }, hourlyRate: 1000 },
  ];

  for (const machine of machines) {
    const { buildVolume, ...machineData } = machine;
    await prisma.machine.create({
      data: {
        ...machineData,
        tenantId: tenant.id,
        powerW: 300, // Default power consumption
        setupMinutes: 15, // Default setup time
        specs: {
          buildVolume: buildVolume,
          resolution: { x: 0.1, y: 0.1, z: 0.1 },
        },
      },
    });
  }

  console.log(`Created ${machines.length} machines`);

  // Create process options
  const processOptions = [
    { 
      process: 'FFF', 
      optionsSchema: {
        finish: {
          type: 'select',
          options: ['standard', 'sanded', 'painted'],
          default: 'standard',
          costs: { standard: 0, sanded: 50, painted: 100 }
        },
        precision: {
          type: 'select',
          options: ['standard', 'high'],
          default: 'standard',
          costs: { standard: 0, high: 100 }
        }
      },
      marginFloorPercent: 20
    },
    { 
      process: 'SLA', 
      optionsSchema: {
        finish: {
          type: 'select',
          options: ['standard', 'clear_coated'],
          default: 'standard',
          costs: { standard: 0, clear_coated: 80 }
        }
      },
      marginFloorPercent: 25
    },
    { 
      process: 'CNC_3AXIS', 
      optionsSchema: {
        finish: {
          type: 'select',
          options: ['as_machined', 'anodized'],
          default: 'as_machined',
          costs: { as_machined: 0, anodized: 150 }
        },
        precision: {
          type: 'select',
          options: ['standard', 'high'],
          default: 'standard',
          costs: { standard: 0, high: 200 }
        }
      },
      marginFloorPercent: 30
    },
    { 
      process: 'LASER_2D', 
      optionsSchema: {
        finish: {
          type: 'select',
          options: ['standard', 'engraved'],
          default: 'standard',
          costs: { standard: 0, engraved: 50 }
        }
      },
      marginFloorPercent: 15
    },
  ];

  for (const option of processOptions) {
    await prisma.processOption.upsert({
      where: {
        tenantId_process: {
          tenantId: tenant.id,
          process: option.process,
        },
      },
      update: {
        optionsSchema: option.optionsSchema,
        marginFloorPercent: option.marginFloorPercent,
      },
      create: {
        ...option,
        tenantId: tenant.id,
      },
    });
  }

  console.log(`Created ${processOptions.length} process options`);

  // Create pricing rules
  const pricingRules = [
    {
      name: 'FFF Base Pricing',
      process: 'FFF',
      formula: 'material_volume * material_cost + print_time * machine_rate',
      parameters: {
        setup_cost: 50,
        min_price: 100,
        markup: 1.35,
      },
      priority: 1,
    },
    {
      name: 'SLA Base Pricing',
      process: 'SLA',
      formula: 'material_volume * material_cost * 1.2 + print_time * machine_rate',
      parameters: {
        setup_cost: 100,
        min_price: 200,
        markup: 1.4,
      },
      priority: 1,
    },
    {
      name: 'CNC Base Pricing',
      process: 'CNC_3AXIS',
      formula: '(material_volume * material_cost + machine_time * machine_rate) * complexity_factor',
      parameters: {
        setup_cost: 200,
        min_price: 500,
        complexity_factor: 1.5,
        markup: 1.5,
      },
      priority: 1,
    },
    {
      name: 'Laser Base Pricing',
      process: 'LASER_2D',
      formula: 'material_area * material_cost + cut_time * machine_rate',
      parameters: {
        setup_cost: 30,
        min_price: 50,
        markup: 1.25,
      },
      priority: 1,
    },
  ];

  for (const rule of pricingRules) {
    await prisma.pricingRule.create({
      data: {
        ...rule,
        tenantId: tenant.id,
      },
    });
  }

  console.log(`Created ${pricingRules.length} pricing rules`);

  // Create margins
  const margins = [
    { 
      type: 'default', 
      marginPercent: 35, 
      floorPercent: 20,
      targetPercent: 40,
      maxDiscountPercent: 15
    },
    { 
      type: 'rush', 
      marginPercent: 50, 
      floorPercent: 35,
      targetPercent: 55,
      maxDiscountPercent: 10
    },
    { 
      type: 'volume', 
      marginPercent: 25, 
      floorPercent: 15,
      targetPercent: 30,
      maxDiscountPercent: 20
    },
  ];

  for (const margin of margins) {
    await prisma.margin.create({
      data: {
        ...margin,
        tenantId: tenant.id,
      },
    });
  }

  console.log(`Created ${margins.length} margins`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });