const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Request to book a ride
// @route   POST /api/bookings/request/:rideId
const requestBooking = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { seats, pickupPoint, specialRequests } = req.body;
    
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }
    
    if (!ride.isAvailable()) {
      return res.status(400).json({ success: false, error: 'Ride is no longer available' });
    }
    
    if (ride.availableSeatsCount < seats) {
      return res.status(400).json({ success: false, error: 'Not enough seats available' });
    }
    
    if (ride.driverId.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot book your own ride' });
    }
    
    // Check if already requested
    const existingRequest = ride.bookedPassengers.find(
      p => p.passengerId.toString() === req.user.id && p.status !== 'rejected'
    );
    
    if (existingRequest) {
      return res.status(400).json({ success: false, error: 'You have already requested this ride' });
    }
    
    // Add booking request
    ride.bookedPassengers.push({
      passengerId: req.user.id,
      seats,
      status: 'pending',
      requestedAt: new Date(),
      pickupPoint,
      specialRequests
    });
    
    await ride.save();
    
    // Create booking record
    const booking = await Booking.create({
      rideId,
      passengerId: req.user.id,
      driverId: ride.driverId,
      seats,
      totalPrice: seats * ride.pricePerSeat,
      status: 'pending'
    });
    
    // TODO: Send notification to driver via socket
    
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Driver accepts/rejects booking request
// @route   PUT /api/bookings/respond/:bookingId
const respondToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    const ride = await Ride.findById(booking.rideId);
    
    if (ride.driverId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    if (action === 'accept') {
      // Update booking status
      booking.status = 'confirmed';
      await booking.save();
      
      // Update ride
      const passengerRequest = ride.bookedPassengers.find(
        p => p.passengerId.toString() === booking.passengerId.toString()
      );
      if (passengerRequest) {
        passengerRequest.status = 'accepted';
        passengerRequest.acceptedAt = new Date();
      }
      
      // Update seats (if ride becomes full)
      if (ride.availableSeatsCount === 0) {
        ride.status = 'full';
      }
      
      await ride.save();
      
      // Update user stats
      await User.findByIdAndUpdate(booking.passengerId, {
        $inc: { totalRidesAsPassenger: 1 }
      });
      
      // TODO: Send notification to passenger
      
    } else if (action === 'reject') {
      booking.status = 'cancelled';
      booking.cancelledBy = 'driver';
      booking.cancelledAt = new Date();
      await booking.save();
      
      const passengerRequest = ride.bookedPassengers.find(
        p => p.passengerId.toString() === booking.passengerId.toString()
      );
      if (passengerRequest) {
        passengerRequest.status = 'rejected';
      }
      await ride.save();
    }
    
    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Driver responds to a passenger booking by ride and passenger IDs
// @route   PUT /api/bookings/respond-by-passenger/:rideId/:passengerId
const respondToBookingByPassenger = async (req, res) => {
  try {
    const { rideId, passengerId } = req.params;
    const { action } = req.body;

    const booking = await Booking.findOne({ rideId, passengerId });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const ride = await Ride.findById(booking.rideId);

    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }

    if (ride.driverId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (action === 'accept') {
      booking.status = 'confirmed';
      await booking.save();

      const passengerRequest = ride.bookedPassengers.find(
        p => p.passengerId.toString() === booking.passengerId.toString()
      );
      if (passengerRequest) {
        passengerRequest.status = 'accepted';
        passengerRequest.acceptedAt = new Date();
      }

      if (ride.availableSeatsCount === 0) {
        ride.status = 'full';
      }

      await ride.save();
      await User.findByIdAndUpdate(booking.passengerId, {
        $inc: { totalRidesAsPassenger: 1 }
      });
    } else if (action === 'reject') {
      booking.status = 'cancelled';
      booking.cancelledBy = 'driver';
      booking.cancelledAt = new Date();
      await booking.save();

      const passengerRequest = ride.bookedPassengers.find(
        p => p.passengerId.toString() === booking.passengerId.toString()
      );
      if (passengerRequest) {
        passengerRequest.status = 'rejected';
      }
      await ride.save();
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Cancel booking (by passenger)
// @route   DELETE /api/bookings/:bookingId
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    if (booking.passengerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    const ride = await Ride.findById(booking.rideId);
    const hoursBeforeRide = (ride.date - new Date()) / (1000 * 60 * 60);
    
    // Check cancellation policy (2 hours before ride)
    if (hoursBeforeRide < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot cancel within 2 hours of ride departure' 
      });
    }
    
    booking.status = 'cancelled';
    booking.cancelledBy = 'passenger';
    booking.cancelledAt = new Date();
    await booking.save();
    
    // Update ride
    const passengerRequest = ride.bookedPassengers.find(
      p => p.passengerId.toString() === req.user.id
    );
    if (passengerRequest) {
      passengerRequest.status = 'cancelled';
    }
    
    // If ride was full, make it active again
    if (ride.status === 'full') {
      ride.status = 'active';
    }
    
    await ride.save();
    
    res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get passenger's bookings
// @route   GET /api/bookings/my-bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passengerId: req.user.id })
      .populate('rideId')
      .populate('driverId', 'name rating profilePhoto phone')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get driver's bookings for their rides
// @route   GET /api/bookings/driver-bookings
const getDriverBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ driverId: req.user.id })
      .populate('rideId')
      .populate('passengerId', 'name rating profilePhoto phone')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Rate a ride (passenger rates driver or driver rates passenger)
// @route   POST /api/bookings/rate/:bookingId
const rateRide = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review, role } = req.body; // role: 'driver' or 'passenger'
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    if (role === 'driver') {
      if (booking.driverId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Not authorized' });
      }
      booking.passengerRating = rating;
      booking.passengerReview = review;
      
      // Update passenger's rating
      const passenger = await User.findById(booking.passengerId);
      await passenger.updateRating(rating);
      
    } else if (role === 'passenger') {
      if (booking.passengerId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Not authorized' });
      }
      booking.driverRating = rating;
      booking.driverReview = review;
      
      // Update driver's rating
      const driver = await User.findById(booking.driverId);
      await driver.updateRating(rating);
    }
    
    await booking.save();
    
    res.status(200).json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  requestBooking,
  respondToBooking,
  respondToBookingByPassenger,
  cancelBooking,
  getMyBookings,
  getDriverBookings,
  rateRide
};