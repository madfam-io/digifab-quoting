import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ProcessType } from '@madfam/shared';
import { Decimal } from 'decimal.js';

@Injectable()
export class PricingService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async calculateQuoteItem(
    tenantId: string,
    process: ProcessType,
    geometryMetrics: any,
    materialId: string,
    machineId: string,
    selections: any,
    quantity: number,
    objective: any,
  ) {
    // Simplified pricing calculation for MVP
    const material = await this.prisma.material.findFirst({
      where: { id: materialId, tenantId },
    });

    const machine = await this.prisma.machine.findFirst({
      where: { id: machineId, tenantId },
    });

    if (!material || !machine) {
      throw new Error('Material or machine not found');
    }

    // Basic calculation
    const volumeCm3 = geometryMetrics.volumeCm3 || 1;
    const materialCost = new Decimal(volumeCm3).mul(material.costPerUnit || 1).div(1000); // Convert to cost per cm³
    const machineHours = volumeCm3 / 60; // Simplified: 60 cm³/hour
    const machineCost = new Decimal(machineHours).mul(machine.hourlyRate || 500);
    
    const unitPrice = materialCost.plus(machineCost).mul(1.5); // 50% markup
    const totalPrice = unitPrice.mul(quantity);

    return {
      unitPrice: unitPrice.toNumber(),
      totalPrice: totalPrice.toNumber(),
      leadDays: 5,
      costBreakdown: {
        material: materialCost.toNumber(),
        machine: machineCost.toNumber(),
        overhead: 0,
        margin: unitPrice.sub(materialCost).sub(machineCost).toNumber(),
      },
      sustainability: {
        score: 75,
        co2eKg: 0.5,
        recycledPercent: 20,
      },
    };
  }

  async getMaterials(tenantId: string, process?: ProcessType) {
    const where: any = {
      tenantId,
    };

    if (process) {
      where.processTypes = {
        has: process,
      };
    }

    return this.prisma.material.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getMachines(tenantId: string, process?: ProcessType) {
    const where: any = {
      tenantId,
    };

    if (process) {
      where.processType = process;
    }

    return this.prisma.machine.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getProcessOptions(tenantId: string, process?: ProcessType) {
    const where: any = {
      tenantId,
    };

    if (process) {
      where.process = process;
    }

    return this.prisma.processOption.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });
  }
}