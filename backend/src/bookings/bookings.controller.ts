import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // POST /bookings — create a new booking
  @Post()
  @HttpCode(HttpStatus.CREATED)
  bookCar(@Body() dto: CreateBookingDto) {
    return this.bookingsService.bookCar(dto);
  }

  // GET /bookings/user/:userId — all bookings belonging to a user
  @Get('user/:userId')
  getUserBookings(@Param('userId') userId: string) {
    return this.bookingsService.getUserBookings(userId);
  }

  // GET /bookings/car/:carId — all bookings for a specific car
  @Get('car/:carId')
  getCarBookings(@Param('carId') carId: string) {
    return this.bookingsService.getCarBookings(carId);
  }

  // GET /bookings/:id — fetch a single booking by id
  @Get(':id')
  getBooking(@Param('id') id: string) {
    return this.bookingsService.getBooking(id);
  }

  // PATCH /bookings/:id/cancel — cancel a booking (userId in body for ownership check)
  @Patch(':id/cancel')
  cancelBooking(@Param('id') id: string, @Body('userId') userId: string) {
    return this.bookingsService.cancelBooking(id, userId);
  }

  // PATCH /bookings/:id/review — add a rating and comment to a booking
  @Patch(':id/review')
  addReview(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
  ) {
    return this.bookingsService.addReview(id, userId, rating, comment);
  }
}
