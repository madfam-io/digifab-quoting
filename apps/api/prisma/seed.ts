import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'default' },
    update: {},
    create: {
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
    { name: 'PLA Standard', type: 'plastic', processTypes: ['FFF'], costPerUnit: 25, color: 'white' },
    { name: 'ABS', type: 'plastic', processTypes: ['FFF'], costPerUnit: 30, color: 'white' },
    { name: 'PETG', type: 'plastic', processTypes: ['FFF'], costPerUnit: 35, color: 'clear' },
    { name: 'TPU 95A', type: 'plastic', processTypes: ['FFF'], costPerUnit: 45, color: 'black' },
    { name: 'Nylon', type: 'plastic', processTypes: ['FFF'], costPerUnit: 50, color: 'white' },
    
    // SLA Materials
    { name: 'Standard Resin', type: 'resin', processTypes: ['SLA'], costPerUnit: 80, color: 'grey' },
    { name: 'Tough Resin', type: 'resin', processTypes: ['SLA'], costPerUnit: 120, color: 'grey' },
    { name: 'Flexible Resin', type: 'resin', processTypes: ['SLA'], costPerUnit: 150, color: 'black' },
    
    // CNC Materials
    { name: 'Aluminum 6061', type: 'metal', processTypes: ['CNC_3AXIS'], costPerUnit: 50, color: 'silver' },
    { name: 'Steel 1018', type: 'metal', processTypes: ['CNC_3AXIS'], costPerUnit: 40, color: 'silver' },
    { name: 'Stainless Steel 304', type: 'metal', processTypes: ['CNC_3AXIS'], costPerUnit: 60, color: 'silver' },
    { name: 'Delrin (POM)', type: 'plastic', processTypes: ['CNC_3AXIS'], costPerUnit: 35, color: 'white' },
    { name: 'Nylon 6', type: 'plastic', processTypes: ['CNC_3AXIS'], costPerUnit: 30, color: 'white' },
    
    // Laser Materials
    { name: 'Acrylic 3mm', type: 'plastic', processTypes: ['LASER_2D'], costPerUnit: 15, color: 'clear' },
    { name: 'Plywood 3mm', type: 'wood', processTypes: ['LASER_2D'], costPerUnit: 10, color: 'natural' },
    { name: 'MDF 3mm', type: 'wood', processTypes: ['LASER_2D'], costPerUnit: 8, color: 'natural' },
  ];

  for (const material of materials) {
    await prisma.material.upsert({
      where: { 
        tenantId_name: {
          tenantId: tenant.id,
          name: material.name,
        },
      },
      update: {},
      create: {
        ...material,
        tenantId: tenant.id,
        properties: {
          color: material.color,
        },
      },
    });
  }

  console.log(`Created ${materials.length} materials`);

  // Create machines
  const machines = [
    // FFF Machines
    { name: 'Prusa MK3S+', processType: 'FFF', buildVolume: { x: 250, y: 210, z: 210 }, hourlyRate: 500 },
    { name: 'Ultimaker S5', processType: 'FFF', buildVolume: { x: 330, y: 240, z: 300 }, hourlyRate: 600 },
    
    // SLA Machines
    { name: 'Form 3', processType: 'SLA', buildVolume: { x: 145, y: 145, z: 185 }, hourlyRate: 800 },
    
    // CNC Machines
    { name: 'Haas VF-2', processType: 'CNC_3AXIS', buildVolume: { x: 762, y: 406, z: 508 }, hourlyRate: 1500 },
    { name: 'Tormach 1100M', processType: 'CNC_3AXIS', buildVolume: { x: 457, y: 254, z: 406 }, hourlyRate: 1200 },
    
    // Laser Machines
    { name: 'Epilog Fusion Pro 48', processType: 'LASER_2D', buildVolume: { x: 1219, y: 914, z: 311 }, hourlyRate: 1000 },
  ];

  for (const machine of machines) {
    await prisma.machine.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: machine.name,
        },
      },
      update: {},
      create: {
        ...machine,
        tenantId: tenant.id,
        capabilities: {},
      },
    });
  }

  console.log(`Created ${machines.length} machines`);

  // Create process options
  const processOptions = [
    // Finishes
    { process: 'FFF', name: 'Standard', type: 'finish', cost: 0 },
    { process: 'FFF', name: 'Sanded', type: 'finish', cost: 50 },
    { process: 'FFF', name: 'Painted', type: 'finish', cost: 100 },
    { process: 'SLA', name: 'Standard', type: 'finish', cost: 0 },
    { process: 'SLA', name: 'Clear Coated', type: 'finish', cost: 80 },
    { process: 'CNC_3AXIS', name: 'As Machined', type: 'finish', cost: 0 },
    { process: 'CNC_3AXIS', name: 'Anodized', type: 'finish', cost: 150 },
    { process: 'LASER_2D', name: 'Standard', type: 'finish', cost: 0 },
    { process: 'LASER_2D', name: 'Engraved', type: 'finish', cost: 50 },
    
    // Precision
    { process: 'FFF', name: 'Standard (±0.3mm)', type: 'precision', cost: 0 },
    { process: 'FFF', name: 'High (±0.1mm)', type: 'precision', cost: 100 },
    { process: 'CNC_3AXIS', name: 'Standard (±0.1mm)', type: 'precision', cost: 0 },
    { process: 'CNC_3AXIS', name: 'High (±0.05mm)', type: 'precision', cost: 200 },
  ];

  for (const option of processOptions) {
    await prisma.processOption.upsert({
      where: {
        tenantId_process_name_type: {
          tenantId: tenant.id,
          process: option.process,
          name: option.name,
          type: option.type,
        },
      },
      update: {},
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
      tenantId: tenant.id,
      name: 'FFF Base Pricing',
      processType: 'FFF',
      formula: 'material_volume * material_cost + print_time * machine_rate',
      parameters: {
        setup_cost: 50,
        min_price: 100,
      },
    },
    {
      tenantId: tenant.id,
      name: 'SLA Base Pricing',
      processType: 'SLA',
      formula: 'material_volume * material_cost * 1.2 + print_time * machine_rate',
      parameters: {
        setup_cost: 100,
        min_price: 200,
      },
    },
    {
      tenantId: tenant.id,
      name: 'CNC Base Pricing',
      processType: 'CNC_3AXIS',
      formula: '(material_volume * material_cost + machine_time * machine_rate) * complexity_factor',
      parameters: {
        setup_cost: 200,
        min_price: 500,
        complexity_factor: 1.5,
      },
    },
    {
      tenantId: tenant.id,
      name: 'Laser Base Pricing',
      processType: 'LASER_2D',
      formula: 'material_area * material_cost + cut_time * machine_rate',
      parameters: {
        setup_cost: 30,
        min_price: 50,
      },
    },
  ];

  for (const rule of pricingRules) {
    await prisma.pricingRule.create({
      data: rule,
    });
  }

  console.log(`Created ${pricingRules.length} pricing rules`);

  // Create margins
  const margins = [
    { tenantId: tenant.id, name: 'Standard Margin', percentage: 35, isDefault: true },
    { tenantId: tenant.id, name: 'Rush Order', percentage: 50, isDefault: false },
    { tenantId: tenant.id, name: 'Volume Discount', percentage: 25, isDefault: false },
  ];

  for (const margin of margins) {
    await prisma.margin.create({
      data: margin,
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