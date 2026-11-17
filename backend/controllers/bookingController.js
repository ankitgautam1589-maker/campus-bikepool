const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

// @desc    Book a seat on an available bike ride (Atomic Concurrency Protected)
// @route   POST /api/bookings
// @access  Private
const bookRide = async (req, res, next) => {
  const passengerId = req.user._id;
  const { rideId, pickupNote, seatsToBook = 1 } = req.body;

  if (!rideId) {
    return res.status(400).json({
      success: false,
      message: 'rideId is required to book a seat',
    });
  }

  const normalizedSeatInput =
    seatsToBook === undefined || seatsToBook === null || seatsToBook === ''
      ? 1
      : seatsToBook;
  const requestedSeats = Number(normalizedSeatInput);

  if (!Number.isInteger(requestedSeats) || requestedSeats < 1 || requestedSeats > 2) {
    return res.status(400).json({
      success: false,
      message: 'Invalid seat request. You can book 1 or 2 seats only.',
    });
  }

  // Quick sanity check: Check if driver is attempting to book their own ride
  const targetRide = await Ride.findById(rideId).select('driver status departureTime');
  if (!targetRide) {
    return res.status(404).json({
      success: false,
      message: 'The requested ride does not exist.',
    });
  }

  if (targetRide.driver.toString() === passengerId.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Drivers cannot book a seat on their own offered ride.',
    });
  }

  if (targetRide.departureTime <= new Date()) {
    return res.status(400).json({
      success: false,
      message: 'This ride has already departed or expired.',
    });
  }

  // Attempt transactional execution (ACID)
  // If MongoDB is running in standalone mode (no replica set), we fall back gracefully to atomic compare-and-swap
  let session = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (err) {
    // Replica set not configured; fallback to direct atomic execution
    session = null;
    useTransaction = false;
  }

  try {
    // -------------------------------------------------------------
    // ATOMIC CONCURRENCY CONTROL:
    // We execute findOneAndUpdate with strict preconditions:
    // 1. Ride ID must match
    // 2. Status must be 'Open'
    // 3. availableSeats MUST be greater than or equal to requested seats
    //
    // The MongoDB storage engine handles document locks atomically:
    // Even if 50 students request the seat at the exact same millisecond,
    // only ONE thread will find availableSeats >= 1. The rest will get null.
    // -------------------------------------------------------------
    const updateOptions = { new: true };
    if (useTransaction) updateOptions.session = session;

    const updatedRide = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        status: 'Open',
        availableSeats: { $gte: requestedSeats },
      },
      {
        $inc: { availableSeats: -requestedSeats },
      },
      updateOptions
    );

    // If updatedRide is null, the seat was already claimed by another concurrent request!
    if (!updatedRide) {
      if (useTransaction) await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: 'Seat unavailable! Another student just booked this seat or the ride is full.',
      });
    }

    // If availableSeats reached 0, transition status to 'Full'
    if (updatedRide.availableSeats === 0) {
      await Ride.findByIdAndUpdate(
        rideId,
        { status: 'Full' },
        updateOptions
      );
    }

    // Create the booking record
    const bookingPayload = {
      ride: rideId,
      passenger: passengerId,
      seatsBooked: requestedSeats,
      pickupNote: pickupNote ? pickupNote.trim() : '',
      status: 'Confirmed',
    };

    let newBooking;
    if (useTransaction) {
      const created = await Booking.create([bookingPayload], { session });
      newBooking = created[0];
      await session.commitTransaction();
    } else {
      // In standalone mode, if Booking.create fails (e.g. duplicate key),
      // we must atomically restore the deducted seats (compensating transaction)
      try {
        newBooking = await Booking.create(bookingPayload);
      } catch (createErr) {
        // Compensating rollback for standalone mode
        await Ride.findByIdAndUpdate(rideId, {
          $inc: { availableSeats: requestedSeats },
          $set: { status: 'Open' },
        });
        throw createErr;
      }
    }

    // Populate ride and passenger details for the response
    await newBooking.populate([
      {
        path: 'ride',
        populate: { path: 'driver', select: 'name email avatar rating phoneNumber bikeDetails' },
      },
      { path: 'passenger', select: 'name studentId department avatar' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Seat successfully reserved!',
      booking: newBooking,
      remainingSeats: updatedRide.availableSeats,
    });
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }

    // Handle duplicate booking attempt (Unique Compound Index on ride + passenger)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already booked a seat on this ride.',
      });
    }

    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// @desc    Get passenger's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({
        path: 'ride',
        populate: { path: 'driver', select: 'name email avatar rating phoneNumber bikeDetails' },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking and atomically restore available seat
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      passenger: req.user._id,
      status: 'Confirmed',
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Active booking not found or already cancelled.',
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Atomically return seat to the ride and reopen if full
    await Ride.findByIdAndUpdate(booking.ride, {
      $inc: { availableSeats: booking.seatsBooked },
      $set: { status: 'Open' },
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seat restored to pool.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookRide,
  getMyBookings,
  cancelBooking,
};
