# Campus Bikepool 🏍️🎓

A modern, mobile-first, full-stack bikepooling and scooter-pooling web application designed specifically for university students. Verified `.edu` students can offer empty pillion seats or reserve rides to campus landmarks, libraries, and transit stations while cutting commute costs and campus congestion.

---

## ⚡ Tech Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, Lucide Icons, Axios (with automatic Bearer token interceptor)
- **Backend**: Node.js, Express.js (Modular RESTful MVC Architecture)
- **Database**: MongoDB with Mongoose (Compound Indexes, Schema-level Validation)
- **Security & Concurrency**: JWT Authentication, Bcrypt password hashing, Atomic `findOneAndUpdate` with precondition locking and ACID Transaction support to prevent double-booking.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **MongoDB** (local instance at `mongodb://127.0.0.1:27017/campus_bikepool` or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Pre-populates 3 verified university students and campus rides
npm start        # Starts Express server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start        # Starts React development server on http://localhost:3000
```

---

## 🔑 Demo Student Credentials

The database comes pre-seeded with 3 verified students:

| Student Name | University Email | Password | Department | Vehicle |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Morgan** | `alex.morgan@university.edu` | `password123` | Computer Science | Yamaha FZ-X 150 |
| **Sarah Chen** | `sarah.chen@university.edu` | `password123` | Electrical Eng | Vespa Elegante 150 |
| **David Kim** | `david.kim@university.edu` | `password123` | Business & MBA | Honda Activa 6G |

---

## 🛡️ Atomic Concurrency Control (Zero Double-Booking Guarantee)

In two-wheeler carpooling, a vehicle typically has **exactly 1 available passenger seat**. Naive check-then-act logic (`if (seats > 0) { seats--; save(); }`) produces severe race conditions when multiple students click "Book" at the same millisecond.

### Implementation Architecture:
```javascript
// 1. Atomic Precondition Execution
const updatedRide = await Ride.findOneAndUpdate(
  {
    _id: rideId,
    status: 'Open',
    availableSeats: { $gte: requestedSeats }, // Strict precondition
  },
  {
    $inc: { availableSeats: -requestedSeats },  // Atomic decrement
  },
  { new: true, session }
);

if (!updatedRide) {
  // If another concurrent thread claimed the seat first,
  // MongoDB returns null without altering any state.
  return res.status(409).json({
    success: false,
    message: 'Seat unavailable! Another student just booked this seat.'
  });
}
```

### Multi-Layer Concurrency Defenses:
1. **Document-Level Engine Locks**: MongoDB's WiredTiger engine executes single-document updates atomically. Only one concurrent request can successfully evaluate `availableSeats >= 1`.
2. **Compound Unique Index**: `bookingSchema.index({ ride: 1, passenger: 1 }, { unique: true })` mathematically prevents the same passenger from submitting concurrent duplicate bookings.
3. **Session Transaction (ACID)**: Deducting the seat and recording the passenger's booking happens within a unified transaction or compensating rollback.

---

## 📁 Project Directory Structure

```text
Campus Bikepool/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & memory fallback
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me
│   │   ├── rideController.js     # Search, Create, My Rides
│   │   └── bookingController.js  # Atomic Concurrency Booking, Cancel
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer Token validation
│   │   └── errorMiddleware.js    # Centralized Error & 404 Handlers
│   ├── models/
│   │   ├── User.js               # Student Schema (.edu regex, bcrypt)
│   │   ├── Ride.js               # Ride Schema (Compound indexes)
│   │   └── Booking.js            # Booking Schema (Unique compound index)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── rideRoutes.js
│   │   └── bookingRoutes.js
│   ├── .env                      # Environment config
│   ├── seed.js                   # Seed script for instant testing
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js    # Axios with Auth Interceptor & 401 handler
│   │   ├── components/
│   │   │   ├── NavigationBar.jsx # Mobile-first bottom bar & desktop header
│   │   │   ├── RideCard.jsx      # Ride Card with verification & helmet badge
│   │   │   └── ProtectedRoute.jsx# Auth Route Guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global User/JWT State Management
│   │   ├── pages/
│   │   │   ├── LoginSignup.jsx   # .edu Domain Validation & Auth
│   │   │   ├── Dashboard.jsx     # Campus stats, quick actions & activity
│   │   │   ├── RideSearch.jsx    # Real-time search, filters & instant booking
│   │   │   └── OfferRide.jsx     # Pillion seat offering form
│   │   ├── App.jsx               # React Router v6 setup
│   │   ├── index.css             # Tailwind base & utilities
│   │   └── index.js              # React DOM Root
│   ├── tailwind.config.js        # Emerald/Slate university palette
│   └── package.json
└── README.md
```

---

## 📡 RESTful API Reference

### Authentication
- `POST /api/auth/register` - Create student account (requires `.edu` domain email).
- `POST /api/auth/login` - Authenticate student and receive JWT token.
- `GET /api/auth/me` - Retrieve current student profile (Bearer token required).

### Rides
- `GET /api/rides/search?origin=&destination=&date=` - Search open rides with available seats.
- `GET /api/rides/my-rides` - Get all rides posted by the logged-in driver.
- `GET /api/rides/:id` - Get individual ride details.
- `POST /api/rides` - Publish a new ride offering.

### Bookings
- `POST /api/bookings` - Atomically reserve a seat on a ride.
- `GET /api/bookings/my-bookings` - View student's active and past bookings.
- `PUT /api/bookings/:id/cancel` - Cancel reservation and atomically restore seat.
