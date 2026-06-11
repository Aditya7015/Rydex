const Chat = require('../models/Chat');

const users = new Map(); // userId -> socketId

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // User authentication and registration
    socket.on('register', (userId) => {
      users.set(userId, socket.id);
      console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    });

    // Join ride chat room
    socket.on('join-ride-chat', (rideId) => {
      socket.join(`ride_${rideId}`);
      console.log(`📢 User joined room: ride_${rideId}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
      const { rideId, senderId, receiverId, message } = data;
      
      try {
        // Save to database
        let chat = await Chat.findOne({ rideId, driverId: senderId, passengerId: receiverId });
        if (!chat) {
          chat = await Chat.findOne({ rideId, driverId: receiverId, passengerId: senderId });
        }
        
        if (chat) {
          chat.messages.push({
            senderId,
            text: message,
            timestamp: new Date(),
            read: false
          });
          chat.lastMessageAt = new Date();
          await chat.save();
        }
        
        // Emit to receiver if online
        const receiverSocketId = users.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new-message', {
            rideId,
            message,
            senderId,
            timestamp: new Date()
          });
        }
        
        // Emit back to sender for confirmation
        socket.emit('message-sent', { success: true });
      } catch (error) {
        socket.emit('message-error', { error: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', ({ rideId, userId, isTyping }) => {
      socket.to(`ride_${rideId}`).emit('user-typing', { userId, isTyping });
    });

    // Disconnect
    socket.on('disconnect', () => {
      for (let [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);
          console.log(`🔴 User ${userId} disconnected`);
          break;
        }
      }
    });
  });
};

module.exports = { setupSocket };