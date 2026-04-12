import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** POST /reviews — submit a review */
  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(dto);
  }

  /** GET /reviews/profile/:userId — user profile with split reviews and avg ratings */
  @Get('profile/:userId')
  getProfile(@Param('userId') userId: string) {
    return this.reviewsService.getProfile(userId);
  }

  /** PATCH /reviews/profile/:userId/bio — update bio */
  @Patch('profile/:userId/bio')
  updateBio(@Param('userId') userId: string, @Body('bio') bio: string) {
    return this.reviewsService.updateBio(userId, bio);
  }

  /** GET /reviews/given/:userId — reviews already submitted by this user */
  @Get('given/:userId')
  getGiven(@Param('userId') userId: string) {
    return this.reviewsService.getReviewsGiven(userId);
  }
}
