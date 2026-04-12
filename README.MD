# DriveShare

A peer-to-peer car rental web application built as a senior design project for CIS 476 at the University of Michigan-Dearborn. DriveShare allows users to list, search, book, and pay for cars through a clean, minimal web interface. The project demonstrates six software design patterns through a full-stack implementation.

---

## Authors

- Abdula Ameen
- Mohammad Alsheraa

---

## Tech Stack

**Frontend**

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Zustand
- React Router v6
- Axios

**Backend**

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- JWT + bcrypt

---

## Design Patterns Implemented

| Pattern | Location | Description |
|---|---|---|
| Singleton | `backend/src/session/` | SessionManager ensures only one active user session at a time |
| Builder | `backend/src/cars/` | CarBuilder constructs Car entities step by step |
| Chain of Responsibility | `backend/src/password/` | Three sequential security question handlers for password recovery |
| Observer | `backend/src/watchlist/` | Renters are notified when a watched car changes price or availability |
| Mediator | `backend/src/chat/` | ChatMediator routes all messages between users & authProvider serves as the mediator for every ui element |
| Proxy | `backend/src/payment/` | PaymentProxy wraps RealPaymentService with auth checks and transaction logging |

---

## Project Structure

```
driveshare/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── car/
│       │   ├── bookings/
│       │   ├── messages/
│       │   └── payment/
│       ├── store/
│       ├── lib/
│       └── types/
│
└── backend/
    └── src/
        ├── auth/
        ├── session/
        ├── cars/
        ├── bookings/
        ├── password/
        ├── watchlist/
        ├── chat/
        ├── payment/
        ├── notifications/
        └── prisma/
```

---

## Features

- User registration and login with JWT authentication
- Password recovery via sequential security question flow
- Car listing creation using the Builder pattern
- Location-based car search
- Booking system with date conflict detection
- Watchlist with real-time price and availability notifications
- In-app messaging between renters and owners
- Simulated payment processing with proxy-layer logging
- Notification system for booking and payment events
- ratings and review system for owner and renter

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

Clone the repository:

```bash
git clone https://github.com/A-Aboody/DriveShare
cd driveshare
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### Environment Setup

Create a `.env` file in `backend/` with the following:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/driveshare"
JWT_SECRET="your-secret-key"
```

### Database Setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### Running the App

Start the backend:

```bash
cd backend
npm run start:dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3000`.

---

## License

This project was created for academic purposes at the University of Michigan-Dearborn.
