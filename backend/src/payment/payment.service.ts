import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PaymentProxy } from './payment.proxy.js';
import { RealPaymentService } from './real-payment.service.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/**
 * NestJS injectable that wires up the proxy pattern.
 * The proxy sits in front of the real service — all calls go through it.
 */
@Injectable()
export class PaymentNestService {
  private readonly proxy: PaymentProxy;

  constructor() {
    // Build the chain: proxy wraps real, real gets the prisma instance
    this.proxy = new PaymentProxy(new RealPaymentService(prisma));
  }

  processPayment(userId: string, bookingId: string, amount: number) {
    return this.proxy.makePayment(userId, bookingId, amount);
  }

  /** Look up the payment record for a given booking */
  getPaymentForBooking(bookingId: string) {
    return prisma.payment.findFirst({
      where: { bookingId },
    });
  }
}
