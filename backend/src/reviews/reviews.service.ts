import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import type { CreateReviewDto } from './dto/create-review.dto.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

@Injectable()
export class ReviewsService {

  async createReview(dto: CreateReviewDto) {
    const { reviewerId, revieweeId, bookingId, rating, comment, role } = dto;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Prevent duplicate review for the same booking + role combination
    const existing = await prisma.review.findFirst({
      where: { bookingId, reviewerId, role },
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this booking');
    }

    return prisma.review.create({
      data: { reviewerId, revieweeId, bookingId, rating, comment: comment ?? '', role },
      include: {
        reviewer: { select: { id: true, email: true } },
        reviewee: { select: { id: true, email: true } },
      },
    });
  }

  /** All reviews received by a user, plus profile summary */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    });

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    return { user, reviews, averageRating };
  }

  /** Reviews the given user has left (given), keyed by bookingId + role for easy lookup */
  async getReviewsGiven(userId: string) {
    return prisma.review.findMany({
      where: { reviewerId: userId },
      select: { bookingId: true, role: true, rating: true, comment: true },
    });
  }
}
