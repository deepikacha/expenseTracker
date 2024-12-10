const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, password, email } = req.body;
    console.log("auth.js line 10", req.body);

    if (!name || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ where: { name } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, password: hashedPassword, email });
    const token = generateToken(newUser.id);

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Error registering user' });
  }
};

exports.generateAccessToken = function(id, name, ispremiumuser) {
  return jwt.sign({ userId: id, name: name, ispremiumuser }, process.env.JWT_SECRET_KEY);
};

// Login a user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
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

    const token = exports.generateAccessToken(user.id, user.name, user.ispremiumuser);
    console.log(token);
    res.status(200).json({ message: 'Login successful', token, isPremiumUser: user.ispremiumuser });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the email using Sendinblue
    const client = SibApiV3Sdk.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: user.email }];
    sendSmtpEmail.sender = { email: 'your-email@example.com', name: 'Your Name' };
    sendSmtpEmail.subject = 'Password Reset';
    sendSmtpEmail.textContent = 'This is a dummy email for password reset';

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    res.status(500).json({ message: 'An error occurred while sending password reset email.' });
  }
};
