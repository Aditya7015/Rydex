// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const cloudinary = require('../config/cloudinary');
// const { sendOTP, verifyOTP } = require('../utils/sendSMS');

// // Generate JWT Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE
//   });
// };

// // @desc    Send OTP for phone verification
// // @route   POST /api/auth/send-otp
// const sendPhoneOTP = async (req, res) => {
//   try {
//     const { phone } = req.body;
    
//     if (!phone || phone.length !== 10) {
//       return res.status(400).json({ success: false, error: 'Valid 10-digit phone number is required' });
//     }
    
//     // Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    
//     // Check if user exists
//     let user = await User.findOne({ phone });
    
//     if (user) {
//       // Update existing user's OTP
//       user.phoneOTP = { code: otp, expiresAt };
//       await user.save();
//     } else {
//       // Create temporary user (will be completed after OTP verification)
//       user = await User.create({
//         phone,
//         name: 'Temp User', // Will be updated
//         password: Math.random().toString(36).slice(-8) // Temporary password
//       });
//       user.phoneOTP = { code: otp, expiresAt };
//       await user.save();
//     }
    
//     // Send OTP via SMS (in production)
//     // await sendOTP(phone, otp);
    
//     // For development, log OTP
//     console.log(`📱 OTP for ${phone}: ${otp}`);
    
//     res.status(200).json({
//       success: true,
//       message: 'OTP sent successfully',
//       // Remove in production
//       devOTP: otp
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Verify OTP and complete registration
// // @route   POST /api/auth/verify-otp
// const verifyOTPAndRegister = async (req, res) => {
//   try {
//     const { phone, otp, name, email, password } = req.body;
    
//     const user = await User.findOne({ phone });
    
//     if (!user) {
//       return res.status(404).json({ success: false, error: 'User not found' });
//     }
    
//     // Verify OTP
//     if (user.phoneOTP.code !== otp || user.phoneOTP.expiresAt < new Date()) {
//       return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
//     }
    
//     // Update user profile
//     user.name = name;
//     user.isPhoneVerified = true;
//     user.phoneOTP = undefined;
    
//     if (email) user.email = email;
//     if (password) user.password = password;
    
//     await user.save();
    
//     // Generate token
//     const token = generateToken(user._id);
    
//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//         email: user.email,
//         profilePhoto: user.profilePhoto,
//         rating: user.rating
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Login with phone and password
// // @route   POST /api/auth/login
// const login = async (req, res) => {
//   try {
//     const { phone, password } = req.body;
    
//     const user = await User.findOne({ phone }).select('+password');
    
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ success: false, error: 'Invalid credentials' });
//     }
    
//     const token = generateToken(user._id);
    
//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//         email: user.email,
//         profilePhoto: user.profilePhoto,
//         rating: user.rating
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Get current user profile
// // @route   GET /api/auth/me
// const getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Update user profile
// // @route   PUT /api/auth/update-profile
// const updateProfile = async (req, res) => {
//   try {
//     const { name, email, preferences, profilePhoto } = req.body;
    
//     const user = await User.findById(req.user.id);
    
//     if (name) user.name = name;
//     if (email) user.email = email;
//     if (profilePhoto) user.profilePhoto = profilePhoto;
//     if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
//     await user.save();
    
//     res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//         email: user.email,
//         profilePhoto: user.profilePhoto,
//         rating: user.rating,
//         preferences: user.preferences
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Upload profile photo
// // @route   POST /api/auth/upload-photo
// const uploadProfilePhoto = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, error: 'No photo file provided' });
//     }

//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         {
//           folder: 'rydex/profile_photos',
//           resource_type: 'image',
//           transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
//         },
//         (error, result) => {
//           if (error) return reject(error);
//           resolve(result);
//         }
//       );

//       stream.end(req.file.buffer);
//     });

//     const user = await User.findById(req.user.id);
//     user.profilePhoto = uploadResult.secure_url;
//     await user.save();

//     res.status(200).json({ success: true, url: user.profilePhoto });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// module.exports = {
//   sendPhoneOTP,
//   verifyOTPAndRegister,
//   login,
//   getMe,
//   updateProfile,
//   uploadProfilePhoto
// };


const User = require('../models/User');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const { generateAndStoreOTP, verifyOTP, resendOTP } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
const sendEmailOTP = async (req, res) => {
  try {
    const { email, purpose = 'verification' } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    
    const result = await generateAndStoreOTP(email, purpose);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        devOTP: process.env.NODE_ENV !== 'production' ? result.otp : undefined
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify OTP and register/login
// @route   POST /api/auth/verify-otp
// const verifyEmailOTP = async (req, res) => {
//   try {
//     const { email, otp, name, password, purpose = 'verification' } = req.body;
    
//     if (!email || !otp) {
//       return res.status(400).json({ success: false, error: 'Email and OTP are required' });
//     }
    
//     const verification = await verifyOTP(email, otp, purpose);
    
//     if (!verification.success) {
//       return res.status(400).json({ success: false, error: verification.error });
//     }
    
//     let user = await User.findOne({ email });
    
//     if (!user) {
//       if (!name || !password) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Name and password are required for new users' 
//         });
//       }
      
//       user = await User.create({
//         email,
//         name,
//         password,
//         isEmailVerified: true
//       });
//     } else {
//       user.isEmailVerified = true;
//       if (name) user.name = name;
//       await user.save();
//     }
    
//     const token = generateToken(user._id);
    
//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         profilePhoto: user.profilePhoto,
//         rating: user.rating,
//         totalRidesAsDriver: user.totalRidesAsDriver || 0,
//         totalRidesAsPassenger: user.totalRidesAsPassenger || 0,
//         createdAt: user.createdAt
//       }
//     });
//   } catch (error) {
//     console.error('Verify OTP error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// @desc    Verify OTP and register/login
// @route   POST /api/auth/verify-otp
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp, name, phone, password, purpose = 'verification' } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }
    
    const verification = await verifyOTP(email, otp, purpose);
    
    if (!verification.success) {
      return res.status(400).json({ success: false, error: verification.error });
    }
    
    let user = await User.findOne({ email });
    
    if (!user) {
      if (!name || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name and password are required for new users' 
        });
      }
      
      user = await User.create({
        email,
        name,
        phone: phone || '',
        password,
        isEmailVerified: true
      });
    } else {
      user.isEmailVerified = true;
      if (name) user.name = name;
      if (phone) user.phone = phone;
      await user.save();
    }
    
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        rating: user.rating,
        totalRidesAsDriver: user.totalRidesAsDriver || 0,
        totalRidesAsPassenger: user.totalRidesAsPassenger || 0,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
const resendEmailOTP = async (req, res) => {
  try {
    const { email, purpose = 'verification' } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    const result = await resendOTP(email, purpose);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'OTP resent successfully',
        devOTP: process.env.NODE_ENV !== 'production' ? result.otp : undefined
      });
    } else {
      res.status(429).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login with email or phone and password
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    
    if (!emailOrPhone || !password) {
      return res.status(400).json({ success: false, error: 'Email/Phone and password are required' });
    }
    
    let user;
    
    // Check if input is email (contains @) or phone number
    const isEmail = emailOrPhone.includes('@');
    
    if (isEmail) {
      // Login with email
      user = await User.findOne({ email: emailOrPhone.toLowerCase() }).select('+password');
    } else {
      // Login with phone (remove any non-digits)
      const phone = emailOrPhone.replace(/\D/g, '');
      user = await User.findOne({ phone }).select('+password');
    }
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email/phone or password' });
    }
    
    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email/phone or password' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        rating: user.rating,
        totalRidesAsDriver: user.totalRidesAsDriver || 0,
        totalRidesAsPassenger: user.totalRidesAsPassenger || 0,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, preferences, profilePhoto } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        rating: user.rating,
        preferences: user.preferences,
        totalRidesAsDriver: user.totalRidesAsDriver || 0,
        totalRidesAsPassenger: user.totalRidesAsPassenger || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Upload profile photo
// @route   POST /api/auth/upload-photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No photo file provided' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'rydex/profile_photos',
          resource_type: 'image',
          transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    const user = await User.findById(req.user.id);
    user.profilePhoto = uploadResult.secure_url;
    await user.save();

    res.status(200).json({ success: true, url: user.profilePhoto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  sendEmailOTP,
  verifyEmailOTP,
  resendEmailOTP,
  login,
  getMe,
  updateProfile,
  uploadProfilePhoto
};