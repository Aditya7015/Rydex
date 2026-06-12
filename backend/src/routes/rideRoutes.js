const express = require('express');
const {
  createRide,
  searchRides,
  getRideById,
  getMyRides,
  updateRide,
  cancelRide,
  getTrackingStatus
} = require('../controllers/rideController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/search', searchRides);
router.get('/driver/me', protect, getMyRides);
router.post('/', protect, createRide);
router.get('/:id', getRideById);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, cancelRide);
router.get('/:id/tracking-status', getTrackingStatus);

module.exports = router;
