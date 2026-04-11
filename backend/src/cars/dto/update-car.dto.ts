import { IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateCarDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
