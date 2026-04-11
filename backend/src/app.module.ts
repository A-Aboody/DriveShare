import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { CarsModule } from './cars/cars.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { WatchlistModule } from './watchlist/watchlist.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { ChatModule } from './chat/chat.module.js';

@Module({
  imports: [
    AuthModule,
    CarsModule,
    NotificationsModule,
    WatchlistModule,
    BookingsModule,
    PaymentModule,
    ChatModule,
  ],
})
export class AppModule {}
