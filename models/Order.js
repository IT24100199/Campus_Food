// This file defines what an "Order" looks like in our database.
// An order belongs to a student and contains multiple menu items.
// Think of it like a receipt - it has who ordered, what they ordered, and the total.

const mongoose = require('mongoose');

// This is a mini schema for each item inside an order
// e.g. { menuItem: "Egg Rice", quantity: 2 }
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,  // links to a MenuItem in the database
      ref: 'MenuItem',                        // tells mongoose which collection to look in
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1  // must order at least 1
    }
  },
  {
    _id: false  // don't create a separate ID for each item inside the order
  }
);

// Main order schema
const orderSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,  // links to a Student in the database
    ref: 'Student',                         // tells mongoose which collection to look in
    required: true
  },
  items: {
    type: [orderItemSchema],  // array of order items (using the mini schema above)
    validate: {
      validator: val => val.length > 0,  // must have at least one item
      message: 'Order must have at least one item'
    }
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0  // total cannot be negative
  },
  status: {
    type: String,
    enum: ['PLACED', 'PREPARING', 'DELIVERED', 'CANCELLED'],  // only these values allowed
    default: 'PLACED'  // when order is created, status is PLACED
  },
  createdAt: {
    type: Date,
    default: Date.now  // automatically set to current date/time
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;