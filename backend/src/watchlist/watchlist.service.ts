import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/**
 * Pattern: Observer (subscription registry)
 * WatchlistService manages which users are watching which cars. When CarsService
 * updates a car, it queries WatchlistEntry rows to find the current subscribers
 * for that car — these are the logical "observers" in the Observer pattern.
 */
@Injectable()
export class WatchlistService {
  /** Subscribe a user to a car — idempotent */
  async addToWatchlist(userId: string, carId: string) {
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) throw new NotFoundException('Car not found');

    const existing = await prisma.watchlistEntry.findFirst({ where: { userId, carId } });
    if (existing) return existing;

    return prisma.watchlistEntry.create({ data: { userId, carId } });
  }

  /** Unsubscribe a user from a car */
  async removeFromWatchlist(userId: string, carId: string) {
    const entry = await prisma.watchlistEntry.findFirst({ where: { userId, carId } });
    if (!entry) throw new NotFoundException('Watchlist entry not found');
    await prisma.watchlistEntry.delete({ where: { id: entry.id } });
    return { message: 'Removed from watchlist' };
  }

  /** Get all cars a user is watching */
  async getWatchlist(userId: string) {
    return prisma.watchlistEntry.findMany({
      where: { userId },
      include: {
        car: { include: { owner: { select: { id: true, email: true } } } },
      },
    });
  }

  async isWatching(userId: string, carId: string): Promise<boolean> {
    const entry = await prisma.watchlistEntry.findFirst({ where: { userId, carId } });
    return !!entry;
  }
}
