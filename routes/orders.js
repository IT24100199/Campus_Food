// This file handles all API endpoints related to orders.
// POST /orders              - place a new order
// GET /orders               - get all orders (with pagination)
// GET /orders/:id           - get a specific order by ID
// PATCH /orders/:id/status  - update order status
// DELETE /orders/:id        - delete an order

const express = require('express');
const Order = require('../models/Order');       // import Order model
const MenuItem = require('../models/MenuItem'); // import MenuItem model (to calculate price)
const router = express.Router();

// 💰 Helper function: calculate total price from ordered items
// This looks up each menu item's price and multiplies by quantity
async function calculateTotalPrice(items) {
  // Get all the menuItem IDs from the order
  const menuItemIds = items.map(item => item.menuItem);

  // Find all those menu items from the database at once
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

  // Create a quick lookup map: { menuItemId: price }
  const priceMap = {};
  menuItems.forEach(mi => {
    priceMap[mi._id.toString()] = mi.price;
  });

  // Calculate total by multiplying price x quantity for each item
  let total = 0;
  for (const item of items) {
    const price = priceMap[item.menuItem.toString()];
    if (!price) throw new Error(`Invalid menu item ID: ${item.menuItem}`);
    total += price * item.quantity;
  }

  return total;
}

// ➕ Place a new order
router.post('/', async (req, res) => {
  try {
    const { student, items } = req.body;

    // Validate that student and items are provided
    if (!student) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Calculate the total price automatically
    const totalPrice = await calculateTotalPrice(items);

    // Create and save the order
    const order = new Order({ student, items, totalPrice, status: 'PLACED' });
    const saved = await order.save();

    // Re-fetch the order with full student and menuItem details filled in
    const populated = await Order.findById(saved._id)
      .populate('student')           // replace student ID with actual student data
      .populate('items.menuItem');   // replace menuItem ID with actual menu item data

    res.status(201).json(populated);
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// 📋 Get all orders with pagination
// Example: /orders?page=1&limit=5
router.get('/', async (req, res) => {
  try {
    // Get page and limit from URL, use defaults if not provided
    const page = parseInt(req.query.page) || 1;   // default page 1
    const limit = parseInt(req.query.limit) || 10; // default 10 per page
    const skip = (page - 1) * limit; // how many records to skip

    // Get orders for this page
    const orders = await Order.find()
      .sort({ createdAt: -1 })         // newest first
      .skip(skip)                       // skip previous pages
      .limit(limit)                     // only get this many
      .populate('student')
      .populate('items.menuItem');

    // Count total orders for metadata
    const totalOrders = await Order.countDocuments();

    res.json({
      page,
      limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      orders
    });
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get a single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student')
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err.message);
    res.status(400).json({ error: 'Invalid order ID' });
  }
});

// 🔄 Update order status
// Example: PATCH /orders/abc123/status  with body { "status": "PREPARING" }
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['PLACED', 'PREPARING', 'DELIVERED', 'CANCELLED'];

    // Check if the provided status is valid
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    // Find the order and update its status
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true } // new:true returns updated document
    )
      .populate('student')
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// 🗑️ Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(400).json({ error: 'Invalid order ID' });
  }
});

module.exports = router;