import { PaymentService } from './payment.interface.js';

/**
 * Pattern: Proxy (Real Subject)
 * RealPaymentService is the actual implementation that hits the database.
 * It should never be called directly by consumers — use PaymentProxy instead.
 */
export class RealPaymentService implements PaymentService {
  constructor(private readonly prisma: any) {}

  async makePayment(
    userId: string,
    bookingId: string,
    amount: number,
  ): Promise<{ success: boolean; transactionId: string; message: string }> {
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        bookingId,
        amount,
        status: 'completed',
      },
    });

    return {
      success: true,
      transactionId: payment.id,
      message: 'Payment processed',
    };
  }
}
