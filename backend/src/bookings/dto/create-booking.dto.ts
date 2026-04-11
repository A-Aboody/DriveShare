export class CreateBookingDto {
  userId: string;
  carId: string;
  startDate: string; // ISO date string
  endDate: string;
}
