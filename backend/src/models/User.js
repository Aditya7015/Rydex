const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter valid 10-digit phone number']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profilePhoto: {
    type: String,
    default: 'https://res.cloudinary.com/rydex/image/upload/v1/default-avatar.png'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalRidesAsDriver: {
    type: Number,
    default: 0
  },
  totalRidesAsPassenger: {
    type: Number,
    default: 0
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  phoneOTP: {
    code: String,
    expiresAt: Date
  },
  preferences: {
    smoking: { type: Boolean, default: false },
    music: { type: String, enum: ['silence', 'low', 'medium', 'any'], default: 'any' },
    chatting: { type: String, enum: ['quiet', 'talkative', 'any'], default: 'any' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate average rating
userSchema.methods.updateRating = async function(newRating) {
  const total = (this.rating * this.totalRatings) + newRating;
  this.totalRatings += 1;
  this.rating = total / this.totalRatings;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);