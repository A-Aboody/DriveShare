import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CarsService } from './cars.service.js';
import { CreateCarDto } from './dto/create-car.dto.js';
import { UpdateCarDto } from './dto/update-car.dto.js';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  // POST /cars
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createCar(@Body() dto: CreateCarDto) {
    return this.carsService.createCar(dto);
  }

  // GET /cars?location=Detroit
  @Get()
  getCars(@Query('location') location?: string) {
    return this.carsService.getCars(location);
  }

  // GET /cars/owner/:ownerId
  @Get('owner/:ownerId')
  getMyCars(@Param('ownerId') ownerId: string) {
    return this.carsService.getMyCars(ownerId);
  }

  // GET /cars/:id
  @Get(':id')
  getCar(@Param('id') id: string) {
    return this.carsService.getCar(id);
  }

  // PATCH /cars/:id
  @Patch(':id')
  updateCar(@Param('id') id: string, @Body() dto: UpdateCarDto) {
    return this.carsService.updateCar(id, dto);
  }

  // DELETE /cars/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteCar(@Param('id') id: string) {
    return this.carsService.deleteCar(id);
  }
}
