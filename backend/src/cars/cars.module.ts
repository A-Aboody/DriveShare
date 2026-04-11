import { Module } from '@nestjs/common';
import { CarsController } from './cars.controller.js';
import { CarsService } from './cars.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  controllers: [CarsController],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
