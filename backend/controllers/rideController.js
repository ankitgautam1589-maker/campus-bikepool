const Ride = require('../models/Ride');

// @desc    Post a new bike ride offer
// @route   POST /api/rides
// @access  Private (Driver must be authenticated)
const createRide = async (req, res, next) => {
  try {
    const { origin, destination, departureTime, totalSeats, farePerSeat, helmetProvided, bikeModel, notes } = req.body;

    if (!origin || !destination || !departureTime) {
      return res.status(400).json({
        success: false,
        message: 'Origin, destination, and departure time are required.',
      });
    }

    const departure = new Date(departureTime);
    if (isNaN(departure.getTime()) || departure <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Departure time must be a valid future date and time.',
      });
    }

    const seats = Number(totalSeats) || 1;
    if (seats < 1 || seats > 2) {
      return res.status(400).json({
        success: false,
        message: 'A bike pool offering can only offer 1 or 2 passenger seats.',
      });
    }

    const ride = await Ride.create({
      driver: req.user._id,
      origin: origin.trim(),
      destination: destination.trim(),
      departureTime: departure,
      totalSeats: seats,
      availableSeats: seats,
      farePerSeat: Number(farePerSeat) || 0,
      helmetProvided: helmetProvided !== undefined ? helmetProvided : true,
      bikeModel: bikeModel || req.user.bikeDetails?.model || 'Standard Two-Wheeler',
      notes: notes ? notes.trim() : '',
      status: 'Open',
    });

    await ride.populate('driver', 'name avatar department rating isVerifiedStudent bikeDetails');

    res.status(201).json({
      success: true,
      message: 'Ride offered successfully!',
      ride,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search available rides based on origin, destination, and time
// @route   GET /api/rides/search
// @access  Public / Authenticated
const searchRides = async (req, res, next) => {
  try {
    const { origin, destination, date, minSeats } = req.query;

    const query = {
      status: 'Open',
      availableSeats: { $gte: Number(minSeats) || 1 },
    };

    // Case-insensitive regex search for campus spots/landmarks
    if (origin && origin.trim()) {
      query.origin = { $regex: origin.trim(), $options: 'i' };
    }

    if (destination && destination.trim()) {
      query.destination = { $regex: destination.trim(), $options: 'i' };
    }

    // Departure time filtering
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // If requested date is today, ensure departure is in the future
      const now = new Date();
      const effectiveStart = startOfDay > now ? startOfDay : now;

      query.departureTime = { $gte: effectiveStart, $lte: endOfDay };
    } else {
      // Default to future rides only
      query.departureTime = { $gte: new Date() };
    }

    const rides = await Ride.find(query)
      .populate('driver', 'name avatar department rating isVerifiedStudent bikeDetails')
      .sort({ departureTime: 1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ride by ID
// @route   GET /api/rides/:id
// @access  Public / Authenticated
const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id).populate(
      'driver',
      'name email avatar department rating isVerifiedStudent bikeDetails phoneNumber'
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found with the specified ID',
      });
    }

    res.status(200).json({
      success: true,
      ride,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rides posted by the logged in driver
// @route   GET /api/rides/my-rides
// @access  Private
const getMyOfferedRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .sort({ departureTime: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRide,
  searchRides,
  getRideById,
  getMyOfferedRides,
};
