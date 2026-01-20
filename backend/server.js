const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration - Allow requests from frontend and port forwarding scenarios
const corsOptions = {
  origin: [
    'http://localhost:3000',      // Local development
    'http://localhost:5000',      // Backend itself (for health checks)
    /^http:\/\/localhost:\d+$/,   // Any localhost port
    /^https?:\/\/.+\.github\.dev$/, // GitHub Codespaces
    /^https?:\/\/.+\.gitpod\.io$/,  // Gitpod
    /^https?:\/\/.+\.ngrok\.io$/,   // ngrok tunneling
    /^https?:\/\/.+\.asse\.devtunnels\.ms$/, // VS Code Dev Tunnels
    process.env.CORS_ORIGIN       // From environment variable
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/baggagelens')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('⚠️  MongoDB connection warning (continuing without DB):', err.message);
    console.log('ℹ️  Check your internet connection or MongoDB Atlas IP whitelist');
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/luggage', require('./routes/luggage'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/users', require('./routes/users'));
app.use('/api/flight-route', require('./routes/flightRoute'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend API is running' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
});

module.exports = app;
