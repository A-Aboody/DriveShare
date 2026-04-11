import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { CarBuilder } from './car.builder.js';
import { CreateCarDto } from './dto/create-car.dto.js';
import { UpdateCarDto } from './dto/update-car.dto.js';
import { NotificationsService, CarObserver } from '../notifications/notifications.service.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/**
 * Pattern: Builder — every car is constructed via CarBuilder.build(),
 *   never via direct object literal assignment.
 *
 * Pattern: Observer (Subject) — CarsService maintains a list of CarObservers
 *   and calls notifyObservers() when a car's price or availability changes.
 *   Watchers registered in the DB (WatchlistEntry) are the logical "subscribers";
 *   the registered observers (NotificationsService) handle the delivery.
 */
@Injectable()
export class CarsService {
  // Observer pattern: list of registered observer objects
  private readonly observers: CarObserver[] = [];

  constructor(private readonly notificationsService: NotificationsService) {
    // Register notifications service as a car observer on construction
    this.registerObserver(notificationsService);
  }

  /** Observer pattern: register a new observer */
  registerObserver(observer: CarObserver): void {
    this.observers.push(observer);
  }

  /** Observer pattern: broadcast an event to all registered observers */
  private async notifyObservers(
    carId: string,
    event: 'price_changed' | 'availability_changed',
    car: { model: string; year: number; price: number; available: boolean },
    watchers: { userId: string }[],
  ): Promise<void> {
    const message =
      event === 'price_changed'
        ? `Price updated for ${car.model} (${car.year}) — now $${car.price}/day`
        : `${car.model} (${car.year}) is now ${car.available ? 'available' : 'unavailable'}`;

    for (const watcher of watchers) {
      for (const observer of this.observers) {
        observer.update(watcher.userId, message, event, carId);
      }
    }
  }

  /** Builder pattern: construct car data via CarBuilder, then persist */
  async createCar(dto: CreateCarDto) {
    const carData = new CarBuilder()
      .setModel(dto.model)
      .setYear(dto.year)
      .setMileage(dto.mileage)
      .setPrice(dto.price)
      .setLocation(dto.location)
      .setOwnerId(dto.ownerId)
      .build();

    return prisma.car.create({ data: carData });
  }

  /** Search cars by location (CIS-13), or list all */
  async getCars(location?: string) {
    if (location) {
      return prisma.car.findMany({
        where: {
          location: { contains: location, mode: 'insensitive' },
          available: true,
        },
        include: { owner: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    return prisma.car.findMany({
      include: { owner: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCar(id: string) {
    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, email: true } },
        bookings: { select: { startDate: true, endDate: true, status: true } },
      },
    });
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }

  /** Edit listing (CIS-12): update price/availability, trigger observers if changed */
  async updateCar(id: string, dto: UpdateCarDto) {
    const existing = await prisma.car.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Car not found');

    const priceChanged = dto.price !== undefined && dto.price !== existing.price;
    const availabilityChanged =
      dto.available !== undefined && dto.available !== existing.available;

    const updated = await prisma.car.update({
      where: { id },
      data: {
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.available !== undefined && { available: dto.available }),
      },
    });

    // Observer pattern: only notify when state actually changed
    if (priceChanged || availabilityChanged) {
      const watchers = await prisma.watchlistEntry.findMany({ where: { carId: id } });
      if (watchers.length > 0) {
        if (priceChanged) {
          await this.notifyObservers(id, 'price_changed', updated, watchers);
        }
        if (availabilityChanged) {
          await this.notifyObservers(id, 'availability_changed', updated, watchers);
        }
      }
    }

    return updated;
  }

  async deleteCar(id: string) {
    const existing = await prisma.car.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Car not found');
    await prisma.car.delete({ where: { id } });
    return { message: 'Car deleted' };
  }

  async getMyCars(ownerId: string) {
    return prisma.car.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
