const express = require('express');
const router = express.Router();
const {
  bookRide,
  getMyBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(protect);

router.post('/', bookRide);
router.get('/my-bookings', getMyBookings);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
