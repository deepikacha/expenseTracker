const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/auth'); // Import the registerUser function

// POST /register route
router.post('/register', registerUser);  // Register user endpoint

// POST /login route
router.post('/login', loginUser);  // Login user endpoint

module.exports = router;