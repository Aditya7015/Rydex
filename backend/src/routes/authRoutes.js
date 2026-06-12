const express = require('express');
const multer = require('multer');
const {
  sendPhoneOTP,
  verifyOTPAndRegister,
  login,
  getMe,
  updateProfile,
  uploadProfilePhoto
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'photo'));
    }
    cb(null, true);
  }
});

const router = express.Router();

router.post('/send-otp', sendPhoneOTP);
router.post('/verify-otp', verifyOTPAndRegister);
router.post('/login', login);
router.post('/upload-photo', protect, upload.single('photo'), uploadProfilePhoto);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
