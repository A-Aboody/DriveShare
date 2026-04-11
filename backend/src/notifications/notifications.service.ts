import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type NotificationType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'payment_made'
  | 'price_changed'
  | 'availability_changed';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  carId?: string;
  createdAt: Date;
  read: boolean;
}

/**
 * Pattern: Observer (Concrete Observer)
 * NotificationsService implements CarObserver. It registers itself on CarsService
 * (the subject) and receives update() calls whenever a car's price or availability
 * changes. All notification delivery is simulated via console.log and an in-memory
 * store (no database required for this pattern demo).
 */
export interface CarObserver {
  update(userId: string, message: string, type: NotificationType, carId?: string): void;
}

@Injectable()
export class NotificationsService implements CarObserver {
  private readonly store: Notification[] = [];

  /** Called by CarsService (the subject) when observed state changes */
  update(userId: string, message: string, type: NotificationType, carId?: string): void {
    this.sendNotification(userId, message, type, carId);
  }

  sendNotification(
    userId: string,
    message: string,
    type: NotificationType,
    carId?: string,
  ): Notification {
    const notif: Notification = {
      id: randomUUID(),
      userId,
      message,
      type,
      carId,
      createdAt: new Date(),
      read: false,
    };
    this.store.push(notif);
    // Simulate delivery — in production this would be email/push
    console.log(`[NOTIFICATION] → ${userId}: ${message}`);
    return notif;
  }

  getForUser(userId: string): Notification[] {
    return this.store
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  markRead(userId: string, id: string): boolean {
    const notif = this.store.find((n) => n.id === id && n.userId === userId);
    if (!notif) return false;
    notif.read = true;
    return true;
  }

  markAllRead(userId: string): void {
    this.store.filter((n) => n.userId === userId).forEach((n) => (n.read = true));
  }

  getUnreadCount(userId: string): number {
    return this.store.filter((n) => n.userId === userId && !n.read).length;
  }
}
