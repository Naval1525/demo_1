const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());

// CORS configuration: Allow requests from frontend (replace with your frontend URL)
const corsOptions = {
  origin:  'https://thunderous-beignet-4a40a1.netlify.app/', // Allow localhost during local dev
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions)); // Apply the CORS configuration


app.use(cors(corsOptions)); // Apply CORS settings

// Connect to MongoDB
mongoose.connect('mongodb+srv://naval:9zSAcnLcSeRF4jDj@cluster0.nsv37.mongodb.net/cloud101?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1); // Exit process if DB connection fails
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
    // Create a new user and save it to the database
    const user = new User({ name, email });
    await user.save();
    res.status(201).json(user); // Respond with the created user
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export handler for serverless environment (like Vercel)
module.exports = app;

// Vercel doesn't need a listen, so this is used for local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
