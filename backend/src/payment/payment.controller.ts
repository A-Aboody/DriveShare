import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentNestService } from './payment.service.js';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentNestService) {}

  // POST /payment — initiate a payment for a booking
  @Post()
  @HttpCode(HttpStatus.CREATED)
  processPayment(
    @Body('userId') userId: string,
    @Body('bookingId') bookingId: string,
    @Body('amount') amount: number,
  ) {
    return this.paymentService.processPayment(userId, bookingId, amount);
  }

  // GET /payment/booking/:bookingId — retrieve the payment record for a booking
  @Get('booking/:bookingId')
  getPaymentForBooking(@Param('bookingId') bookingId: string) {
    return this.paymentService.getPaymentForBooking(bookingId);
  }
}
