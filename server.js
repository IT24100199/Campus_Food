const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Import routes
const studentRoutes = require('./routes/students');
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');

// Attach routes
app.use('/students', studentRoutes);
app.use('/menu-items', menuItemRoutes);
app.use('/orders', orderRoutes);
app.use('/analytics', analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Campus Food API is running!' });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });