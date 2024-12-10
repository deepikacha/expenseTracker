
const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/password/forgotpassword', authController.forgotPassword); // New route

module.exports = router;
