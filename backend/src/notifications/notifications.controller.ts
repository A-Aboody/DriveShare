import { Controller, Get, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /notifications/:userId
  @Get(':userId')
  getNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getForUser(userId);
  }

  // GET /notifications/:userId/unread-count
  @Get(':userId/unread-count')
  getUnreadCount(@Param('userId') userId: string) {
    return { count: this.notificationsService.getUnreadCount(userId) };
  }

  // PATCH /notifications/:userId/:id/read
  @Patch(':userId/:id/read')
  markRead(@Param('userId') userId: string, @Param('id') id: string) {
    return { success: this.notificationsService.markRead(userId, id) };
  }

  // PATCH /notifications/:userId/read-all
  @Patch(':userId/read-all')
  markAllRead(@Param('userId') userId: string) {
    this.notificationsService.markAllRead(userId);
    return { success: true };
  }
}
