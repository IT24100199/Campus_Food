// This file defines what a "Menu Item" looks like in our database.
// Every food item in the canteen will follow this structure.

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,  // must be provided
      trim: true        // removes extra spaces
    },
    price: {
      type: Number,
      required: true,  // must be provided
      min: 0           // price cannot be negative
    },
    category: {
      type: String,    // e.g. "Rice", "Beverage", "Snack"
      trim: true
    },
    isAvailable: {
      type: Boolean,
      default: true    // when added, item is available by default
    }
  },
  {
    timestamps: true   // automatically adds createdAt and updatedAt fields
  }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;