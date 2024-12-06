const bcrypt = require('bcryptjs');
const { generateToken } = require('../util/jwt');
const User = require('../models/user');
const jwt=require('jsonwebtoken')

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { name, password,email } = req.body;
        console.log("auth.js line 10",req.body)

        if (!name || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ where: { name } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, password: hashedPassword ,email});
        const token=generateToken(newUser.id)

        res.status(201).json({ token });
        
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ message: 'Error registering user' });
    }
};

// Login a user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
         console.log(req.body)
        if (!email || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id);
        console.log(token)
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Error logging in' });
    }
};