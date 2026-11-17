const express = require('express');
const router = express.Router();
const {
  createRide,
  searchRides,
  getRideById,
  getMyOfferedRides,
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

// Public or optionally authenticated search
router.get('/search', searchRides);
router.get('/my-rides', protect, getMyOfferedRides);
router.get('/:id', getRideById);

// Protected routes (Drivers)
router.post('/', protect, createRide);

module.exports = router;
