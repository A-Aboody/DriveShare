import { BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.interface.js';
import { RealPaymentService } from './real-payment.service.js';

/**
 * Pattern: Proxy
 * PaymentProxy wraps RealPaymentService and adds validation and logging before
 * delegating. Controllers never touch RealPaymentService directly — they always
 * go through this proxy.
 */
export class PaymentProxy implements PaymentService {
  constructor(private readonly real: RealPaymentService) {}

  async makePayment(
    userId: string,
    bookingId: string,
    amount: number,
  ): Promise<{ success: boolean; transactionId: string; message: string }> {
    // Validate before delegating to the real service
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    if (amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    console.log(
      `[PaymentProxy] Processing payment: userId=${userId}, bookingId=${bookingId}, amount=${amount}`,
    );

    const result = await this.real.makePayment(userId, bookingId, amount);

    console.log(
      `[PaymentProxy] Payment result: success=${result.success}, transactionId=${result.transactionId}`,
    );

    return result;
  }
}
