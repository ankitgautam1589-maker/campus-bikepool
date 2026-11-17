const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ride must belong to a driver'],
      index: true,
    },
    origin: {
      type: String,
      required: [true, 'Origin campus landmark or address is required'],
      trim: true,
      index: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination campus landmark or address is required'],
      trim: true,
      index: true,
    },
    departureTime: {
      type: Date,
      required: [true, 'Departure date and time is required'],
      index: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 1, // Most two-wheelers have 1 passenger seat
      min: [1, 'Must offer at least 1 seat'],
      max: [2, 'A two-wheeler cannot safely seat more than 2 passengers'],
    },
    availableSeats: {
      type: Number,
      required: true,
      default: 1,
      min: [0, 'Available seats cannot be negative'],
    },
    farePerSeat: {
      type: Number,
      default: 0, // 0 indicates free / shared campus spirit
      min: [0, 'Fare cannot be negative'],
    },
    helmetProvided: {
      type: Boolean,
      default: true,
      required: true,
    },
    bikeModel: {
      type: String,
      trim: true,
      default: 'Standard Two-Wheeler',
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes cannot exceed 200 characters'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'Full', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid ride status',
      },
      default: 'Open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes for search querying
rideSchema.index({ origin: 1, destination: 1, departureTime: 1, status: 1 });
rideSchema.index({ departureTime: 1, status: 1 });
rideSchema.index({ driver: 1, departureTime: -1 });

module.exports = mongoose.model('Ride', rideSchema);
