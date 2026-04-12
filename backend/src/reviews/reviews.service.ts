import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

  /**
   * Full profile for a user — basic info, bio, and reviews split into
   * two buckets: reviews left by renters (the user was acting as owner)
   * and reviews left by owners (the user was acting as renter).
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, bio: true, createdAt: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const allReviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: { reviewer: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // role = 'renter' means the reviewer was a renter, so this user was the owner
    const asOwnerReviews  = allReviews.filter(r => r.role === 'renter');
    // role = 'owner' means the reviewer was an owner, so this user was the renter
    const asRenterReviews = allReviews.filter(r => r.role === 'owner');

    const avg = (arr: typeof allReviews) =>
      arr.length > 0 ? arr.reduce((s, r) => s + r.rating, 0) / arr.length : null;

    return {
      user,
      asOwnerReviews,
      asRenterReviews,
      averageAsOwner:  avg(asOwnerReviews),
      averageAsRenter: avg(asRenterReviews),
      overallAverage:  avg(allReviews),
      totalReviews:    allReviews.length,
    };
  }

  /** Update a user's bio */
  async updateBio(userId: string, bio: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return prisma.user.update({
      where: { id: userId },
      data: { bio },
      select: { id: true, email: true, bio: true, createdAt: true },
    });
  }

  /** Reviews the given user has already submitted — for UI duplicate prevention */
  async getReviewsGiven(userId: string) {
    return prisma.review.findMany({
      where: { reviewerId: userId },
      select: { bookingId: true, role: true, rating: true, comment: true },
    });
  }
}
