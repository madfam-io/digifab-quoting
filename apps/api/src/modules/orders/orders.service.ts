import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { OrderStatus, PaymentStatus, QuoteStatus } from '@madfam/shared';

// TODO: Add InvoiceStatus to shared enums
enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}
import { customAlphabet } from 'nanoid';

const generateOrderNumber = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private jobsService: JobsService,
  ) {}

  async createOrderFromQuote(
    quoteId: string,
    tenantId: string,
    paymentInfo?: {
      stripeSessionId?: string;
      stripePaymentIntentId?: string;
    },
  ) {
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, tenantId },
      include: {
        quoteItems: {
          include: {
            part: true,
          },
        },
        customer: true,
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    if (quote.status !== QuoteStatus.APPROVED) {
      throw new BadRequestException('Quote must be approved before creating an order');
    }

    // Check if order already exists
    const existingOrder = await this.prisma.order.findFirst({
      where: { quoteId, tenantId },
    });

    if (existingOrder) {
      return existingOrder;
    }

    // Create order number
    const orderNumber = `ORD-${generateOrderNumber()}`;

    // Create order with items in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          quoteId,
          customerId: quote.customerId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          subtotal: quote.subtotal,
          tax: quote.tax,
          shipping: quote.shipping,
          totalAmount: quote.totalPrice,
          currency: quote.currency,
          tenantId,
          orderItems: {
            create: quote.quoteItems.map((item) => ({
              partId: item.partId,
              quantity: item.quantity,
              process: item.process,
              material: item.material,
              finishOptions: item.finishOptions,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              leadTimeDays: item.leadTimeDays,
              tenantId,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      // Link payment intent if provided
      if (paymentInfo?.stripePaymentIntentId) {
        await tx.paymentIntent.update({
          where: {
            stripePaymentIntentId: paymentInfo.stripePaymentIntentId,
          },
          data: {
            orderId: newOrder.id,
          },
        });
      }

      // Update quote status
      await tx.quote.update({
        where: { id: quoteId },
        data: { status: QuoteStatus.ORDERED },
      });

      return newOrder;
    });

    // Queue invoice generation
    await this.jobsService.addJob('generate-invoice', {
      orderId: order.id,
      tenantId,
    });

    this.logger.log(`Created order ${order.orderNumber} from quote ${quoteId}`);
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, tenantId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === OrderStatus.IN_PRODUCTION && { productionStartedAt: new Date() }),
        ...(status === OrderStatus.COMPLETED && { completedAt: new Date() }),
        ...(status === OrderStatus.SHIPPED && { shippedAt: new Date() }),
      },
    });

    this.logger.log(`Updated order ${order.orderNumber} status to ${status}`);
    return updatedOrder;
  }

  async getOrder(orderId: string, tenantId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        customer: true,
        orderItems: {
          include: {
            part: true,
          },
        },
        invoices: true,
        paymentIntents: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrderByNumber(orderNumber: string, tenantId: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNumber, tenantId },
      include: {
        customer: true,
        orderItems: {
          include: {
            part: true,
          },
        },
        invoices: true,
        paymentIntents: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async listOrders(
    tenantId: string,
    filters?: {
      customerId?: string;
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(filters?.customerId && { customerId: filters.customerId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.paymentStatus && { paymentStatus: filters.paymentStatus }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: true,
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async generateInvoice(orderId: string, tenantId: string) {
    const order = await this.getOrder(orderId, tenantId);

    // Check if invoice already exists
    const existingInvoice = await this.prisma.invoice.findFirst({
      where: { orderId, tenantId },
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Generate invoice number
    const invoiceNumber = `INV-${generateOrderNumber()}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId,
        customerId: order.customerId,
        status: InvoiceStatus.DRAFT,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        totalAmount: order.totalAmount,
        currency: order.currency,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        tenantId,
        lineItems: {
          create: order.orderItems.map((item) => ({
            description: `${item.part.name} - ${item.process} - ${item.material}`,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.subtotal,
            tenantId,
          })),
        },
      },
    });

    // Queue PDF generation
    await this.jobsService.addJob('generate-invoice-pdf', {
      invoiceId: invoice.id,
      tenantId,
    });

    this.logger.log(`Generated invoice ${invoice.invoiceNumber} for order ${order.orderNumber}`);
    return invoice;
  }
}
