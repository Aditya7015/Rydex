const Chat = require('../models/Chat');
const Ride = require('../models/Ride');

const users = new Map(); // userId -> socketId
const rideRooms = new Map(); // rideId -> { driverSocketId, passengerSockets Set }

// Location storage (in production, use Redis)
const activeRideLocations = new Map(); // rideId -> { location, lastUpdate, driverId }

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // User authentication and registration
    socket.on('register', (userId) => {
      users.set(userId, socket.id);
      socket.userId = userId;
      console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    });

    // ============ LIVE TRACKING EVENTS ============
    
    // Driver starts sharing location
    socket.on('driver:start-sharing', async (data) => {
      const { rideId, bookingId } = data;
      const driverId = socket.userId;
      
      // Verify driver owns this ride
      const ride = await Ride.findById(rideId);
      if (!ride || ride.driverId.toString() !== driverId) {
        socket.emit('error', { message: 'Unauthorized to share location for this ride' });
        return;
      }
      
      // Join driver to ride room
      socket.join(`ride:${rideId}`);
      
      // Store ride room info
      if (!rideRooms.has(rideId)) {
        rideRooms.set(rideId, { driverSocketId: socket.id, passengerSockets: new Set() });
      } else {
        rideRooms.get(rideId).driverSocketId = socket.id;
      }
      
      console.log(`🚗 Driver ${driverId} started sharing location for ride ${rideId}`);
      
      // Notify passengers that tracking is available
      socket.to(`ride:${rideId}`).emit('driver:tracking-available', {
        rideId,
        message: 'Driver is sharing live location'
      });
    });

    // Driver sends location update
    socket.on('driver:update-location', async (data) => {
      const { rideId, location } = data;
      const driverId = socket.userId;
      
      // Store location with timestamp
      activeRideLocations.set(rideId, {
        driverId,
        location: {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy || 10,
          heading: location.heading || 0,
          speed: location.speed || 0
        },
        lastUpdate: Date.now(),
        timestamp: new Date().toISOString()
      });
      
      // Auto cleanup after 30 minutes of no updates
      setTimeout(() => {
        const stored = activeRideLocations.get(rideId);
        if (stored && stored.lastUpdate === Date.now() - 30000) {
          activeRideLocations.delete(rideId);
        }
      }, 30 * 60 * 1000);
      
      // Broadcast to all passengers in this ride room
      socket.to(`ride:${rideId}`).emit('driver:location-update', {
        rideId,
        location: {
          lat: location.lat,
          lng: location.lng,
          heading: location.heading,
          speed: location.speed,
          timestamp: new Date().toISOString()
        }
      });
      
      // Also store last location for new passengers joining
      socket.emit('driver:location-sent', { success: true });
    });

    // Driver stops sharing location
    socket.on('driver:stop-sharing', async (data) => {
      const { rideId } = data;
      
      activeRideLocations.delete(rideId);
      
      if (rideRooms.has(rideId)) {
        rideRooms.delete(rideId);
      }
      
      socket.to(`ride:${rideId}`).emit('driver:tracking-stopped', {
        rideId,
        message: 'Driver has stopped sharing location'
      });
      
      socket.leave(`ride:${rideId}`);
      console.log(`🚗 Driver stopped sharing location for ride ${rideId}`);
    });

    // Passenger requests current driver location
    socket.on('passenger:request-location', async (data) => {
      const { rideId } = data;
      
      const storedLocation = activeRideLocations.get(rideId);
      if (storedLocation && storedLocation.location) {
        socket.emit('driver:location-update', {
          rideId,
          location: storedLocation.location,
          isLive: true,
          lastUpdate: storedLocation.timestamp
        });
      } else {
        socket.emit('driver:location-unavailable', {
          rideId,
          message: 'Driver location not available'
        });
      }
    });

    // Passenger joins ride room for tracking
    socket.on('passenger:join-ride', async (data) => {
      const { rideId } = data;
      const passengerId = socket.userId;
      
      // Verify passenger has booking for this ride
      const ride = await Ride.findById(rideId);
      if (!ride) {
        socket.emit('error', { message: 'Ride not found' });
        return;
      }
      
      const isPassenger = ride.bookedPassengers.some(
        p => p.passengerId.toString() === passengerId && p.status === 'accepted'
      );
      
      if (!isPassenger && ride.driverId.toString() !== passengerId) {
        socket.emit('error', { message: 'Not authorized to track this ride' });
        return;
      }
      
      socket.join(`ride:${rideId}`);
      
      if (rideRooms.has(rideId)) {
        rideRooms.get(rideId).passengerSockets.add(socket.id);
      } else {
        rideRooms.set(rideId, { driverSocketId: null, passengerSockets: new Set([socket.id]) });
      }
      
      console.log(`👤 Passenger ${passengerId} joined ride room ${rideId}`);
      
      // Send current location if available
      const storedLocation = activeRideLocations.get(rideId);
      if (storedLocation && storedLocation.location) {
        socket.emit('driver:location-update', {
          rideId,
          location: storedLocation.location,
          isLive: true,
          lastUpdate: storedLocation.timestamp
        });
      }
    });

    // Passenger leaves ride room
    socket.on('passenger:leave-ride', async (data) => {
      const { rideId } = data;
      
      socket.leave(`ride:${rideId}`);
      
      if (rideRooms.has(rideId)) {
        rideRooms.get(rideId).passengerSockets.delete(socket.id);
      }
      
      console.log(`👤 Passenger left ride room ${rideId}`);
    });

    // ============ CHAT EVENTS (Existing) ============
    
    // Join ride chat room
    socket.on('join-ride-chat', (rideId) => {
      const chatRoom = `ride_chat_${rideId}`;
      socket.join(chatRoom);
      console.log(`📢 User joined chat room: ${chatRoom}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
      const { rideId, senderId, receiverId, message } = data;
      const chatRoom = `ride_chat_${rideId}`;
      
      try {
        let chat = await Chat.findOne({ rideId, driverId: senderId, passengerId: receiverId });
        if (!chat) {
          chat = await Chat.findOne({ rideId, driverId: receiverId, passengerId: senderId });
        }

        if (!chat) {
          const ride = await Ride.findById(rideId);
          if (!ride) {
            throw new Error('Ride not found');
          }

          const rideDriverId = ride.driverId.toString();
          if (rideDriverId !== senderId && rideDriverId !== receiverId) {
            throw new Error('Sender or receiver must be the ride driver');
          }

          const driverId = rideDriverId === senderId ? senderId : receiverId;
          const passengerId = driverId === senderId ? receiverId : senderId;

          chat = await Chat.create({
            rideId,
            driverId,
            passengerId,
            messages: []
          });
        }
        
        chat.messages.push({
          senderId,
          text: message,
          timestamp: new Date(),
          read: false
        });
        chat.lastMessageAt = new Date();
        await chat.save();
        
        socket.to(chatRoom).emit('new-message', {
          rideId,
          message,
          senderId,
          timestamp: new Date()
        });
        
        socket.emit('message-sent', { success: true });
      } catch (error) {
        socket.emit('message-error', { error: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', ({ rideId, userId, isTyping }) => {
      socket.to(`ride_chat_${rideId}`).emit('user-typing', { userId, isTyping });
    });

    // ============ HELPER: Get active rides location ============
    socket.on('get-active-rides-location', () => {
      const locations = [];
      for (const [rideId, data] of activeRideLocations.entries()) {
        locations.push({
          rideId,
          location: data.location,
          lastUpdate: data.timestamp
        });
      }
      socket.emit('active-rides-location', { locations });
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Clean up ride rooms
      for (const [rideId, roomData] of rideRooms.entries()) {
        if (roomData.driverSocketId === socket.id) {
          roomData.driverSocketId = null;
          // Notify passengers that driver disconnected
          io.to(`ride:${rideId}`).emit('driver:tracking-stopped', {
            rideId,
            message: 'Driver disconnected'
          });
        }
        if (roomData.passengerSockets.has(socket.id)) {
          roomData.passengerSockets.delete(socket.id);
        }
        
        // Clean up empty rooms
        if (!roomData.driverSocketId && roomData.passengerSockets.size === 0) {
          rideRooms.delete(rideId);
        }
      }
      
      // Remove from users map
      if (socket.userId) {
        users.delete(socket.userId);
        console.log(`🔴 User ${socket.userId} disconnected`);
      }
    });
  });
};

// Helper function to get driver location (can be called from controllers)
const getDriverLocation = (rideId) => {
  return activeRideLocations.get(rideId) || null;
};

// Helper function to check if ride is being tracked
const isRideTracked = (rideId) => {
  return activeRideLocations.has(rideId);
};

module.exports = { setupSocket, getDriverLocation, isRideTracked };