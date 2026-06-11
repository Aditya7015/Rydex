const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  from: {
    city: { type: String, required: true },
    landmark: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  to: {
    city: { type: String, required: true },
    landmark: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  date: {
    type: Date,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  seatsAvailable: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  pricePerSeat: {
    type: Number,
    required: true,
    min: 0
  },
  vehicleInfo: {
    make: String,
    model: String,
    color: String,
    numberPlate: String,
    photos: [String]
  },
  preferences: {
    smoking: Boolean,
    pets: Boolean,
    luggage: Boolean,
    music: String,
    chatting: String,
    acAvailable: { type: Boolean, default: true }
  },
  additionalInfo: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['active', 'full', 'in-progress', 'completed', 'cancelled'],
    default: 'active'
  },
  bookedPassengers: [{
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    seats: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: Date,
    pickupPoint: String,
    specialRequests: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better search performance
rideSchema.index({ 'from.city': 1, 'to.city': 1, date: 1, status: 1 });
rideSchema.index({ driverId: 1, status: 1 });
rideSchema.index({ date: 1 });

// Virtual for available seats count
rideSchema.virtual('availableSeatsCount').get(function() {
  const bookedSeats = this.bookedPassengers
    .filter(p => p.status === 'accepted')
    .reduce((sum, p) => sum + p.seats, 0);
  return this.seatsAvailable - bookedSeats;
});

// Method to check if ride is available
rideSchema.methods.isAvailable = function() {
  return this.status === 'active' && this.availableSeatsCount > 0;
};

module.exports = mongoose.model('Ride', rideSchema);
