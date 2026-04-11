import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller.js';
import { PaymentNestService } from './payment.service.js';

@Module({
  controllers: [PaymentController],
  providers: [PaymentNestService],
  exports: [PaymentNestService],
})
export class PaymentModule {}
