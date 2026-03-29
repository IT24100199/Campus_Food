// This file handles all API endpoints related to menu items.
// POST /menu-items              - add a new menu item
// GET /menu-items               - get all menu items
// GET /menu-items/search        - search menu items by name or category

const express = require('express');
const MenuItem = require('../models/MenuItem'); // import the MenuItem model
const router = express.Router();

// ➕ Add a new menu item
router.post('/', async (req, res) => {
  try {
    // Take the data sent in the request body and create a new menu item
    const menuItem = new MenuItem(req.body);
    const saved = await menuItem.save(); // save to database
    res.status(201).json(saved); // 201 means "successfully created"
  } catch (err) {
    console.error('Error creating menu item:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// 📋 Get all menu items
router.get('/', async (req, res) => {
  try {
    // Get all items from database, newest first
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Error fetching menu items:', err.message);
    res.status(500).json({ error: err.message }); // 500 means "server error"
  }
});

// 🔍 Search menu items by name or category
// Example: /menu-items/search?name=rice  or  /menu-items/search?category=Beverage
router.get('/search', async (req, res) => {
  try {
    const { name, category } = req.query; // get search terms from URL
    let filter = {}; // empty filter means "get everything"

    if (name) {
      // 'i' means case-insensitive, so "rice" and "Rice" both work
      filter.name = { $regex: name, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }

    // Find items matching the filter, sorted by name
    const items = await MenuItem.find(filter).sort({ name: 1 });
    res.json(items);
  } catch (err) {
    console.error('Error searching menu items:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;