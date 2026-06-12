// const express = require('express');
// const multer = require('multer');
// const {
//   sendPhoneOTP,
//   verifyOTPAndRegister,
//   login,
//   getMe,
//   updateProfile,
//   uploadProfilePhoto
// } = require('../controllers/authController');
// const { protect } = require('../middleware/auth');

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 10 * 1024 * 1024
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
//     if (!allowedTypes.includes(file.mimetype)) {
//       return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'photo'));
//     }
//     cb(null, true);
//   }
// });

// const router = express.Router();

// router.post('/send-otp', sendPhoneOTP);
// router.post('/verify-otp', verifyOTPAndRegister);
// router.post('/login', login);
// router.post('/upload-photo', protect, upload.single('photo'), uploadProfilePhoto);
// router.get('/me', protect, getMe);
// router.put('/update-profile', protect, updateProfile);

// module.exports = router;



const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  sendEmailOTP,
  verifyEmailOTP,
  resendEmailOTP,
  login,
  getMe,
  updateProfile,
  uploadProfilePhoto
} = require('../controllers/authController');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

// Public routes
router.post('/send-otp', sendEmailOTP);
router.post('/verify-otp', verifyEmailOTP);
router.post('/resend-otp', resendEmailOTP);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/upload-photo', protect, upload.single('photo'), uploadProfilePhoto);

module.exports = router;