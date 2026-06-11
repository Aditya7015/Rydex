const express = require('express');
const {
  sendPhoneOTP,
  verifyOTPAndRegister,
  login,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/send-otp', sendPhoneOTP);
router.post('/verify-otp', verifyOTPAndRegister);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
