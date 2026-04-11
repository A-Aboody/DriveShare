import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @Min(1886)
  year: number;

  @IsNumber()
  @Min(0)
  mileage: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;
}
