const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTP, verifyOTP } = require('../utils/sendSMS');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Send OTP for phone verification
// @route   POST /api/auth/send-otp
const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit phone number is required' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    
    // Check if user exists
    let user = await User.findOne({ phone });
    
    if (user) {
      // Update existing user's OTP
      user.phoneOTP = { code: otp, expiresAt };
      await user.save();
    } else {
      // Create temporary user (will be completed after OTP verification)
      user = await User.create({
        phone,
        name: 'Temp User', // Will be updated
        password: Math.random().toString(36).slice(-8) // Temporary password
      });
      user.phoneOTP = { code: otp, expiresAt };
      await user.save();
    }
    
    // Send OTP via SMS (in production)
    // await sendOTP(phone, otp);
    
    // For development, log OTP
    console.log(`📱 OTP for ${phone}: ${otp}`);
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Remove in production
      devOTP: otp
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-otp
const verifyOTPAndRegister = async (req, res) => {
  try {
    const { phone, otp, name, email, password } = req.body;
    
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Verify OTP
    if (user.phoneOTP.code !== otp || user.phoneOTP.expiresAt < new Date()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
    
    // Update user profile
    user.name = name;
    user.isPhoneVerified = true;
    user.phoneOTP = undefined;
    
    if (email) user.email = email;
    if (password) user.password = password;
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        profilePhoto: user.profilePhoto,
        rating: user.rating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login with phone and password
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    const user = await User.findOne({ phone }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        profilePhoto: user.profilePhoto,
        rating: user.rating
      }
    });
  } catch (error) {
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
    const { name, email, preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        profilePhoto: user.profilePhoto,
        rating: user.rating,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  sendPhoneOTP,
  verifyOTPAndRegister,
  login,
  getMe,
  updateProfile
};