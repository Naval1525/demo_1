const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// MongoDB Connection URL
const MONGODB_URI = 'mongodb+srv://naval:9zSAcnLcSeRF4jDj@cluster0.nsv37.mongodb.net/cloud101';

// Connect to MongoDB (with detailed error logging)
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Monitor DB connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

// Create User model
const User = mongoose.model('User', userSchema);

// Test DB Connection endpoint
app.get('/db-status', async (req, res) => {
  try {
    const status = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      status: statusMap[status],
      readyState: status,
      details: {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Register route
app.post('/api/register', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection not ready',
      status: 'Error',
      readyState: mongoose.connection.readyState
    });
  }

  try {
    const { name, email } = req.body;
    console.log('Received registration request:', { name, email });

    const user = new User({ name, email });
    const savedUser = await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: savedUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Server error',
      details: err.message,
      code: err.code
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running!',
    dbStatus: mongoose.connection.readyState
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});