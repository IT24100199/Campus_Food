// This file handles all analytics/summary endpoints.
// GET /analytics/total-spent/:studentId  - total money spent by a student
// GET /analytics/top-menu-items          - most ordered food items
// GET /analytics/daily-orders            - how many orders per day

const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// 💰 Get total amount spent by a specific student
// Example: /analytics/total-spent/abc123
router.get('/total-spent/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if the studentId is a valid MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    // Aggregation pipeline - like a series of steps to process data
    const result = await Order.aggregate([
      // Step 1: Only look at orders belonging to this student
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },

      // Step 2: Add up all the totalPrice values
      { $group: { _id: '$student', totalSpent: { $sum: '$totalPrice' } } }
    ]);

    // If no orders found, total is 0
    const totalSpent = result.length > 0 ? result[0].totalSpent : 0;

    res.json({ studentId, totalSpent });
  } catch (err) {
    console.error('Error calculating total spent:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🏆 Get top selling menu items
// Example: /analytics/top-menu-items?limit=5
router.get('/top-menu-items', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5; // default top 5

    const result = await Order.aggregate([
      // Step 1: Break the items array into individual documents
      // e.g. one order with 3 items becomes 3 separate records
      { $unwind: '$items' },

      // Step 2: Group by menuItem and sum up all quantities
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' }
        }
      },

      // Step 3: Sort by most ordered first
      { $sort: { totalQuantity: -1 } },

      // Step 4: Only return top N results
      { $limit: limit }
    ]);

    // Fill in the actual menu item details (name, price etc)
    const populated = await MenuItem.populate(result, {
      path: '_id',
      model: 'MenuItem'
    });

    // Format the response nicely
    const formatted = populated.map(item => ({
      menuItem: item._id,
      totalQuantity: item.totalQuantity
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching top menu items:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📅 Get daily order counts
// Shows how many orders were placed each day
router.get('/daily-orders', async (req, res) => {
  try {
    const result = await Order.aggregate([
      // Step 1: Group orders by date (just the date part, not time)
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orderCount: { $sum: 1 } // count each order as 1
        }
      },

      // Step 2: Sort by date oldest first
      { $sort: { _id: 1 } }
    ]);

    // Format the response nicely
    const formatted = result.map(item => ({
      date: item._id,
      orderCount: item.orderCount
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching daily orders:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;