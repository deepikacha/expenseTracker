// utils/jwt.js
const jwt = require('jsonwebtoken');

// Secret key to sign the JWT tokens (should be stored securely, e.g., in environment variables)
const JWT_SECRET = process.env.JWT_SECRET_KEY;
// Create JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET); // Token expires in 1 hour
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.log(error.message)
    return null; // Token is invalid or expired
  }
}

module.exports = { generateToken, verifyToken };
