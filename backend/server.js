const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Attempt MongoDB Connection
connectDB();

const app = express();

// Core Middleware - allow any incoming origin with credentials
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory-fallback',
    timestamp: new Date().toISOString(),
    service: 'Campus Bikepool REST API',
  });
});

// Dynamic Route Switcher: If MongoDB is connected, use real Mongoose controllers; otherwise, use in-memory store
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    // Mongoose is connected: route through standard MongoDB routes
    if (req.path.startsWith('/auth')) return require('./routes/authRoutes')(req, res, next);
    if (req.path.startsWith('/rides')) return require('./routes/rideRoutes')(req, res, next);
    if (req.path.startsWith('/bookings')) return require('./routes/bookingRoutes')(req, res, next);
  }
  // Fallback: In-memory store (zero configuration needed)
  return require('./mockRouter')(req, res, next);
});

// Centralized Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Campus Bikepool API running on http://localhost:${PORT}`);
  console.log(`[Database Mode] ${mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'In-Memory Demo Mode Active (No local MongoDB required)'}`);
});
