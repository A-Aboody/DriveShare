import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/**
 * Pattern: handles the full booking lifecycle — creation with overlap checking,
 * cancellation, and post-trip reviews. Integrates with NotificationsService to
 * alert the renter when a booking is confirmed.
 */
@Injectable()
export class BookingsService {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Book a car for a date range. Validates the range, checks car availability,
   * checks for scheduling conflicts, then creates the booking and marks the car
   * as unavailable.
   */
  async bookCar(dto: CreateBookingDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const car = await prisma.car.findUnique({ where: { id: dto.carId } });
    if (!car) throw new NotFoundException('Car not found');
    if (!car.available) throw new BadRequestException('Car is not available');

    // Fetch all active bookings for this car (ignore cancelled ones)
    const existingBookings = await prisma.booking.findMany({
      where: { carId: dto.carId, status: { not: 'cancelled' } },
    });

    // Overlap check: new booking overlaps if it starts before an existing one ends
    // and ends after that existing one starts
    for (const booking of existingBookings) {
      const existingStart = new Date(booking.startDate);
      const existingEnd = new Date(booking.endDate);
      if (start < existingEnd && end > existingStart) {
        throw new ConflictException('Car is already booked for those dates');
      }
    }

    const newBooking = await prisma.booking.create({
      data: {
        userId: dto.userId,
        carId: dto.carId,
        startDate: start,
        endDate: end,
        status: 'confirmed',
      },
    });

    // Mark car as unavailable now that it has a confirmed booking
    await prisma.car.update({
      where: { id: dto.carId },
      data: { available: false },
    });

    // Notify the user that their booking is confirmed
    this.notificationsService.sendNotification(
      dto.userId,
      `Booking confirmed for ${car.model} from ${start.toDateString()} to ${end.toDateString()}`,
      'booking_created',
    );

    return newBooking;
  }

  /** Get all bookings for a user, including the associated car details */
  async getUserBookings(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: { car: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get all bookings for a car, including minimal user info */
  async getCarBookings(carId: string) {
    return prisma.booking.findMany({
      where: { carId },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { startDate: 'asc' },
    });
  }

  /** Fetch a single booking with its car and user details */
  async getBooking(id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        car: true,
        user: { select: { id: true, email: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  /**
   * Cancel a booking. Verifies the requesting user owns this booking,
   * then sets status to 'cancelled' and re-opens the car for new bookings.
   */
  async cancelBooking(id: string, userId: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new BadRequestException('You can only cancel your own bookings');
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    // Car is free again once the booking is cancelled
    await prisma.car.update({
      where: { id: booking.carId },
      data: { available: true },
    });

    return updated;
  }

  /**
   * Get all bookings for cars owned by a given user, including renter info.
   * Used by the owner to see who rented their cars and leave reviews.
   */
  async getOwnerBookings(ownerId: string) {
    return prisma.booking.findMany({
      where: { car: { ownerId } },
      include: {
        car: { select: { id: true, model: true, year: true, price: true, location: true } },
        user: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Add a rating and comment to a completed booking. Only the renter can review,
   * and only if the booking is in 'confirmed' status.
   */
  async addReview(id: string, userId: string, rating: number, comment: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new BadRequestException('You can only review your own bookings');
    }
    if (booking.status !== 'confirmed') {
      throw new BadRequestException('Only confirmed bookings can be reviewed');
    }

    return prisma.booking.update({
      where: { id },
      data: { rating, comment },
    });
  }
}
