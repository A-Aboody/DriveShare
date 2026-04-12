export class CreateReviewDto {
  reviewerId: string;
  revieweeId: string;
  bookingId: string;
  rating: number;       // 1–5
  comment: string;
  role: string;         // "renter" | "owner"
}
