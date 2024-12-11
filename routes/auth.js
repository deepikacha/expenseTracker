const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/password/forgotpassword', authController.forgotPassword); // Forgot password route
router.get('/password/reset-password/:id', authController.resetPassword);
 // Reset password route
//   router.get('/password/reset-password/:id', (req,res)=>{
//     console.log("msg")
//     req.send("message:success")
//   });

router.post('/password/updatepassword/:id', authController.updatePassword); // Update password route

module.exports = router;
