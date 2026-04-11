export interface PaymentService {
  makePayment(
    userId: string,
    bookingId: string,
    amount: number,
  ): Promise<{ success: boolean; transactionId: string; message: string }>;
}
