const express = require('express');
const {
  createRide,
  searchRides,
  getRideById,
  getMyRides,
  updateRide,
  cancelRide
} = require('../controllers/rideController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/search', searchRides);
router.get('/driver/me', protect, getMyRides);
router.post('/', protect, createRide);
router.get('/:id', getRideById);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, cancelRide);

module.exports = router;
