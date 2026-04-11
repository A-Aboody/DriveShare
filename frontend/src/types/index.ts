export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Car {
  id: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  location: string;
  available: boolean;
  ownerId: string;
  owner?: { id: string; email: string };
  bookings?: { startDate: string; endDate: string; status: string }[];
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  status: string;
  rating?: number;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type:
    | 'booking_created'
    | 'booking_confirmed'
    | 'payment_made'
    | 'price_changed'
    | 'availability_changed';
  carId?: string;
  createdAt: string;
  read: boolean;
}

export interface WatchlistEntry {
  id: string;
  userId: string;
  carId: string;
  car?: Car;
}

export interface Session {
  user: User | null;
  token: string | null;
  isActive: boolean;
}

export interface BookingWithCar extends Booking {
  car: { id: string; model: string; year: number; price: number; location: string };
  user?: { id: string; email: string };
}

export interface Payment {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender?: { id: string; email: string };
  receiver?: { id: string; email: string };
}
