const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seats: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  passengerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  driverRating: {
    type: Number,
    min: 1,
    max: 5
  },
  passengerReview: String,
  driverReview: String,
  cancelledBy: {
    type: String,
    enum: ['passenger', 'driver', 'system']
  },
  cancellationReason: String,
  cancelledAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
bookingSchema.index({ passengerId: 1, status: 1 });
bookingSchema.index({ driverId: 1, status: 1 });
bookingSchema.index({ rideId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);