// This file handles all API endpoints related to students.
// POST /students        - add a new student
// GET /students/:id     - get a specific student by their ID

const express = require('express');
const Student = require('../models/Student'); // import the Student model
const router = express.Router();

// ➕ Add a new student
router.post('/', async (req, res) => {
  try {
    // Take the data sent in the request body and create a new student
    const student = new Student(req.body);
    const saved = await student.save(); // save to database
    res.status(201).json(saved); // 201 means "successfully created"
  } catch (err) {
    console.error('Error creating student:', err.message);
    res.status(400).json({ error: err.message }); // 400 means "bad request"
  }
});

// 🔍 Get a student by their ID
router.get('/:id', async (req, res) => {
  try {
    // req.params.id gets the ID from the URL e.g. /students/abc123
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' }); // 404 means "not found"
    }
    res.json(student);
  } catch (err) {
    console.error('Error fetching student:', err.message);
    res.status(400).json({ error: 'Invalid student ID' });
  }
});

module.exports = router;