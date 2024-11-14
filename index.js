const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: 'https://thunderous-beignet-4a40a1.netlify.app',  // Remove trailing slash
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

// Register route
app.post('/api/register', async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = new User({ name, email });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});