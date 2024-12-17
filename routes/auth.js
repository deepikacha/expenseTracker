const express = require('express');
const {Authorize}=require('../middleware/auth')
const { forgotPassword, resetPassword, registerUser, loginUser, updatePassword,getUserData } = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/password/forgotpassword', forgotPassword); 
router.get('/password/reset-password/:id', resetPassword);

router.post('/password/updatepassword/:id', updatePassword); 
router.get('/user/data',Authorize,getUserData)

module.exports = router;
