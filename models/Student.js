// This file defines what a "Student" looks like in our database.
// Think of it like a form template - every student must have these fields.

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,  // must be provided
      trim: true        // removes extra spaces
    },
    email: {
      type: String,
      required: true,  // must be provided
      unique: true,    // no two students can have same email
      trim: true
    },
    faculty: {
      type: String,
      trim: true
    },
    year: {
      type: Number,
      min: 1,  // minimum year is 1
      max: 4   // maximum year is 4
    }
  },
  {
    timestamps: true  // automatically adds createdAt and updatedAt fields
  }
);

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;