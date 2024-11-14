const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: ['https://thunderous-beignet-4a40a1.netlify.app', '*'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Improved MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://naval:9zSAcnLcSeRF4jDj@cluster0.nsv37.mongodb.net/cloud101', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log('MongoDB Connected Successfully!');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    // Retry connection
    setTimeout(connectDB, 5000);
  }
};

// Initial connection
connectDB();

// Handle MongoDB connection errors
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  setTimeout(connectDB, 5000);
});

// Reconnect if disconnected
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Reconnecting...');
  setTimeout(connectDB, 5000);
});

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

// Create User model
const User = mongoose.model('User', userSchema);

// Register route with connection check
app.post('/api/register', async (req, res) => {
  // Check MongoDB connection first
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection not ready',
      status: 'Error'
    });
  }

  try {
    const { name, email } = req.body;
    console.log('Received registration request:', { name, email });

    if (!name || !email) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: { name: !name, email: !email }
      });
    }

    const existingUser = await User.findOne({ email }).maxTimeMS(5000);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email });
    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser);

    res.status(201).json(savedUser);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Server error',
      details: err.message,
      code: err.code
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running!',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});