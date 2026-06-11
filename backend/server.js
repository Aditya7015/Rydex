const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const { setupSocket } = require('./src/config/socket');
const errorHandler = require('./src/middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Socket.io
setupSocket(io);

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/rides', require('./src/routes/rideRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/chat', require('./src/routes/chatRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Rydex API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Rydex Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
}); 