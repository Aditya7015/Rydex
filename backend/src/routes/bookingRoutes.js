const express = require('express');
const {
  requestBooking,
  respondToBooking,
  cancelBooking,
  getMyBookings,
  getDriverBookings,
  rateRide
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/my-bookings', getMyBookings);
router.get('/driver-bookings', getDriverBookings);
router.post('/request/:rideId', requestBooking);
router.put('/respond/:bookingId', respondToBooking);
router.post('/rate/:bookingId', rateRide);
router.delete('/:bookingId', cancelBooking);

module.exports = router;
