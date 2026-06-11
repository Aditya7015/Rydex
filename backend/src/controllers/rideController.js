const Ride = require('../models/Ride');
const User = require('../models/User');

// @desc    Create a new ride
// @route   POST /api/rides
const createRide = async (req, res) => {
  try {
    const {
      from,
      to,
      date,
      departureTime,
      seatsAvailable,
      pricePerSeat,
      vehicleInfo,
      preferences,
      additionalInfo
    } = req.body;
    
    const ride = await Ride.create({
      driverId: req.user.id,
      from,
      to,
      date,
      departureTime,
      seatsAvailable,
      pricePerSeat,
      vehicleInfo,
      preferences,
      additionalInfo
    });
    
    res.status(201).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Search rides
// @route   GET /api/rides/search
const searchRides = async (req, res) => {
  try {
    const { from, to, date, seats = 1 } = req.query;
    
    const query = {
      status: 'active',
      'from.city': { $regex: new RegExp(from, 'i') },
      'to.city': { $regex: new RegExp(to, 'i') },
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
      }
    };
    
    const rides = await Ride.find(query)
      .populate('driverId', 'name rating profilePhoto totalRidesAsDriver')
      .sort({ date: 1, departureTime: 1 });
    
    // Filter rides with available seats
    const availableRides = rides.filter(ride => ride.isAvailable() && ride.availableSeatsCount >= seats);
    
    res.status(200).json({ success: true, count: availableRides.length, rides: availableRides });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get ride by ID
// @route   GET /api/rides/:id
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driverId', 'name rating profilePhoto totalRidesAsDriver phone')
      .populate('bookedPassengers.passengerId', 'name rating profilePhoto');
    
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }
    
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get driver's rides
// @route   GET /api/rides/driver/me
const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driverId: req.user.id })
      .sort({ date: -1, createdAt: -1 })
      .populate('bookedPassengers.passengerId', 'name rating profilePhoto');
    
    res.status(200).json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update ride
// @route   PUT /api/rides/:id
const updateRide = async (req, res) => {
  try {
    let ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }
    
    // Check if user is the driver
    if (ride.driverId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this ride' });
    }
    
    ride = await Ride.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Cancel ride
// @route   DELETE /api/rides/:id
const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }
    
    if (ride.driverId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel this ride' });
    }
    
    ride.status = 'cancelled';
    await ride.save();
    
    // TODO: Notify all booked passengers
    
    res.status(200).json({ success: true, message: 'Ride cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createRide,
  searchRides,
  getRideById,
  getMyRides,
  updateRide,
  cancelRide
};