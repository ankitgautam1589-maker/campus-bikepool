const express = require('express');
const bcrypt = require('bcryptjs');
const { users, rides, bookings, generateToken, mockAuthMiddleware } = require('./mockStore');

const router = express.Router();

// --- AUTH ROUTES ---
router.post('/auth/register', (req, res) => {
  const { name, email, studentId, password, department, phoneNumber, bikeDetails } = req.body;
  if (!name || !email || !studentId || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const eduDomainRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)?edu(\.[a-zA-Z]{2,})?$/i;
  if (!eduDomainRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Must be an accredited university email ending in .edu' });
  }

  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase() || u.studentId === studentId);
  if (exists) {
    return res.status(409).json({ success: false, message: 'Student email or ID already registered.' });
  }

  const newUser = {
    _id: 'user_' + Date.now(),
    name,
    email: email.toLowerCase(),
    studentId,
    passwordHash: bcrypt.hashSync(password, 10),
    department: department || 'General Studies',
    phoneNumber,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    isVerifiedStudent: true,
    rating: { average: 5.0, count: 0 },
    bikeDetails: bikeDetails || { hasBike: false },
  };

  users.push(newUser);
  const token = generateToken(newUser._id);
  const { passwordHash, ...userClean } = newUser;
  userClean.id = newUser._id;

  res.status(201).json({ success: true, token, user: userClean });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === email?.toLowerCase());
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Account not found for this email. Please click the "Create Account" tab to register first.',
    });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password. Please verify your password and try again.',
    });
  }

  const token = generateToken(user._id);
  const { passwordHash, ...userClean } = user;
  userClean.id = user._id;
  res.status(200).json({ success: true, token, user: userClean });
});

router.get('/auth/me', mockAuthMiddleware, (req, res) => {
  const { passwordHash, ...userClean } = req.user;
  userClean.id = req.user._id;
  res.status(200).json({ success: true, user: userClean });
});

// --- RIDE ROUTES ---
router.get('/rides/search', (req, res) => {
  const { origin, destination } = req.query;
  let results = rides.filter((r) => r.status === 'Open' && r.availableSeats > 0);

  if (origin && origin.trim()) {
    results = results.filter((r) => r.origin.toLowerCase().includes(origin.trim().toLowerCase()));
  }
  if (destination && destination.trim()) {
    results = results.filter((r) => r.destination.toLowerCase().includes(destination.trim().toLowerCase()));
  }

  res.status(200).json({ success: true, count: results.length, rides: results });
});

router.get('/rides/my-rides', mockAuthMiddleware, (req, res) => {
  const myRides = rides.filter((r) => (r.driver?._id || r.driver) === req.user._id);
  res.status(200).json({ success: true, count: myRides.length, rides: myRides });
});

router.get('/rides/:id', (req, res) => {
  const ride = rides.find((r) => r._id === req.params.id);
  if (!ride) return res.status(404).json({ success: false, message: 'Ride not found.' });
  res.status(200).json({ success: true, ride });
});

router.post('/rides', mockAuthMiddleware, (req, res) => {
  const { origin, destination, departureTime, totalSeats, farePerSeat, helmetProvided, bikeModel, notes } = req.body;
  if (!origin || !destination || !departureTime) {
    return res.status(400).json({ success: false, message: 'Origin, destination, and departure time are required.' });
  }

  const { passwordHash, ...driverClean } = req.user;
  const newRide = {
    _id: 'ride_' + Date.now(),
    driver: driverClean,
    origin: origin.trim(),
    destination: destination.trim(),
    departureTime: new Date(departureTime).toISOString(),
    totalSeats: Number(totalSeats) || 1,
    availableSeats: Number(totalSeats) || 1,
    farePerSeat: Number(farePerSeat) || 0,
    helmetProvided: helmetProvided !== undefined ? helmetProvided : true,
    bikeModel: bikeModel || req.user.bikeDetails?.model || 'Two-Wheeler',
    notes: notes || '',
    status: 'Open',
    createdAt: new Date().toISOString(),
  };

  rides.unshift(newRide);
  res.status(201).json({ success: true, message: 'Ride offered successfully!', ride: newRide });
});

// --- BOOKING ROUTES ---
router.post('/bookings', mockAuthMiddleware, (req, res) => {
  const { rideId, seatsToBook = 1, pickupNote } = req.body;
  const ride = rides.find((r) => r._id === rideId);

  if (!ride) {
    return res.status(404).json({ success: false, message: 'Ride not found.' });
  }

  const driverId = ride.driver?._id || ride.driver;
  if (driverId === req.user._id) {
    return res.status(400).json({ success: false, message: 'Drivers cannot book their own rides.' });
  }

  const alreadyBooked = bookings.find(
    (b) => (b.ride?._id || b.ride) === rideId && (b.passenger?._id || b.passenger) === req.user._id && b.status === 'Confirmed'
  );
  if (alreadyBooked) {
    return res.status(409).json({ success: false, message: 'You have already booked a seat on this ride.' });
  }

  // Atomic condition check in event loop
  if (ride.availableSeats < seatsToBook || ride.status !== 'Open') {
    return res.status(409).json({ success: false, message: 'Seat unavailable! Another student just booked this seat.' });
  }

  ride.availableSeats -= seatsToBook;
  if (ride.availableSeats <= 0) {
    ride.status = 'Full';
  }

  const { passwordHash, ...passengerClean } = req.user;
  const newBooking = {
    _id: 'booking_' + Date.now(),
    ride,
    passenger: passengerClean,
    seatsBooked: Number(seatsToBook),
    pickupNote: pickupNote || '',
    verificationPin: Math.floor(1000 + Math.random() * 9000).toString(),
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  };

  bookings.unshift(newBooking);

  res.status(201).json({
    success: true,
    message: 'Seat successfully reserved!',
    booking: newBooking,
    remainingSeats: ride.availableSeats,
  });
});

router.get('/bookings/my-bookings', mockAuthMiddleware, (req, res) => {
  const myBookings = bookings.filter((b) => (b.passenger?._id || b.passenger) === req.user._id);
  res.status(200).json({ success: true, count: myBookings.length, bookings: myBookings });
});

router.put('/bookings/:id/cancel', mockAuthMiddleware, (req, res) => {
  const booking = bookings.find((b) => b._id === req.params.id && (b.passenger?._id || b.passenger) === req.user._id);
  if (!booking || booking.status !== 'Confirmed') {
    return res.status(404).json({ success: false, message: 'Active booking not found.' });
  }

  booking.status = 'Cancelled';
  const targetRide = rides.find((r) => r._id === (booking.ride?._id || booking.ride));
  if (targetRide) {
    targetRide.availableSeats += booking.seatsBooked;
    targetRide.status = 'Open';
  }

  res.status(200).json({ success: true, message: 'Booking cancelled successfully.' });
});

module.exports = router;
