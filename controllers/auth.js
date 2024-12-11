const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { v4: uuidv4 } = require('uuid');
const ForgotPasswordRequest = require('../models/forgotPasswordRequests');
const  EmailService  = require('../services/nodEmail');




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

// Forgot password


exports.forgotPassword = async (req, res) => {
  const userEmail = req.body.email;
  try {
    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Register user's reset password request and set UUID
    const uuid = uuidv4();
    //// await user.createForgotPasswordRequest({ id: uuid, isActive: true });

    const passwordRequest = new ForgotPasswordRequest({
      id: uuid,
      userId: user.id,
      isActive: true,
    });
    await passwordRequest.save();

    // Define the email content
    const emailSubject = "Password Reset Request";
    const emailHtml = `
      <p>Hi ${user.username},</p>
      <p>Please click the <a href="http://localhost:3000/password/reset-password/${uuid}">link</a> to reset your password.</p>`;

    // Send the email using the EmailService
    await EmailService.sendEmail(userEmail, emailSubject, emailHtml);

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error sending email" });
  }
};
// Reset password
exports.resetPassword = async (req, res) => {
  //Todo: Send reset password form
  try {
    const token = req.params.id;
    console.log(token)
    const userRequest = await ForgotPasswordRequest.findOne({ where:{id:token} });
    console.log(userRequest.isactive)

    if (!userRequest)
       return res.status(404).send(` <html> <body> <h1>Invalid or Expired Reset Link</h1>
     <p>The reset link you used is invalid or has expired. Please request a new password reset.</p>
      </body> </html> `);

    if (!userRequest.isactive)

      return res.send(
        "<center><h1>Password reset request has expired!</h1></center>"
      );

    //Todo: Mark the request as inactive
    // await userRequest.update({ isActive: false });
    // userRequest.isactive = false;
    // await userRequest.save();

    res.status(200).send(` <form action="/password/updatepassword/${token}" method="POST">
       <input type="hidden" name="token" value="${token}" /> 
       <label for="new-password">New Password:</label> 
       <input type="password" name="newPassword" id="new-password" required />
        <button type="submit">Reset Password</button> </form> `);
  } catch (err) {
    console.log(err.message);
    
     res.status(500).send(` <html> <body> <h1>Error Resetting Password</h1> 
      <p>An error occurred while processing your password reset request. Please try again later.</p>
       </body> </html> `);
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  const { id } = req.params;
  const newPassword=req.body.newPassword;

  try {
    const request = await ForgotPasswordRequest.findOne({ where: { id } });

    if (!request || !request.isactive) {
      return res.status(400).send(` <html> <body> <h1>Invalid or expired reset link</h1>
         <p>The reset link you used is invalid or has expired. Please request a new password reset.</p> 
         </body> </html> `);
    }

    const user = await User.findOne({ where: { id: request.userId } });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    request.isactive = false;
    await request.save();

    res.status(200).send(` <html> <body> <h1>Password Updated Successfully</h1>
       <p>Your password has been updated successfully. You can now <a href="/login">login</a> with your new password.</p> 
       </body> </html> `);
  } catch (error) {
    console.error('Error updating password:', error.message);
    res.status(500).send(` <html> <body> <h1>Error Updating Password</h1> 
      <p>An error occurred while updating your password. Please try again later.</p>
       </body> </html> `);
  }
};
