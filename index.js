const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: ['https://thunderous-beignet-4a40a1.netlify.app', '*'],  // Added '*' for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect('mongodb+srv://naval:9zSAcnLcSeRF4jDj@cluster0.nsv37.mongodb.net/cloud101?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

// Create User model
const User = mongoose.model('User', userSchema);

// Register route with detailed error handling
app.post('/api/register', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Log the received data
    console.log('Received registration request:', { name, email });

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: { name: !name, email: !email }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = new User({ name, email });
    const savedUser = await user.save();

    // Log success
    console.log('User saved successfully:', savedUser);

    res.status(201).json(savedUser);
  } catch (err) {
    console.error('Detailed error:', err);
    res.status(500).json({
      message: 'Server error',
      details: err.message,
      code: err.code
    });
  }
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});