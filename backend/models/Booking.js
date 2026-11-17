const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Booking must reference a Ride'],
      index: true,
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must reference a Passenger'],
      index: true,
    },
    seatsBooked: {
      type: Number,
      default: 1,
      min: [1, 'Must book at least 1 seat'],
      max: [2, 'Cannot book more than 2 seats'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'Confirmed',
      index: true,
    },
    pickupNote: {
      type: String,
      maxlength: [150, 'Pickup note cannot exceed 150 characters'],
      trim: true,
    },
    verificationPin: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(), // 4-digit ride verification PIN
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: prevents a student from submitting duplicate active bookings for the same ride
bookingSchema.index({ ride: 1, passenger: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
