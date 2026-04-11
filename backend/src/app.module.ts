import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { CarsModule } from './cars/cars.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { WatchlistModule } from './watchlist/watchlist.module.js';

@Module({
  imports: [AuthModule, CarsModule, NotificationsModule, WatchlistModule],
})
export class AppModule {}