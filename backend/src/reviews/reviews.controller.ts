import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** POST /reviews — submit a review (renter reviewing owner or owner reviewing renter) */
  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(dto);
  }

  /** GET /reviews/profile/:userId — user profile with all received reviews + avg rating */
  @Get('profile/:userId')
  getProfile(@Param('userId') userId: string) {
    return this.reviewsService.getProfile(userId);
  }

  /** GET /reviews/given/:userId — reviews this user has already submitted (for UI state) */
  @Get('given/:userId')
  getGiven(@Param('userId') userId: string) {
    return this.reviewsService.getReviewsGiven(userId);
  }
}
