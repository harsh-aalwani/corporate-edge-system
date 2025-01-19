import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';

export const loginUser = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  // Input validation and sanitization
  if (!userEmail || !userPassword) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!validator.isEmail(userEmail)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const sanitizedEmail = validator.normalizeEmail(userEmail);

  try {
    // Find user by email
    const user = await User.findOne({ userEmail: sanitizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update user status and save
    user.userStatus = true;
    await user.save();

    // Create session and store userId and userRoleid
    req.session.userId = user.userId;
    req.session.userRoleid = user.userRoleid;

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ message: 'Failed to create session' });
      }

      // Check user role and redirect accordingly
      if (user.userRoleid === 'SuperAdmin') {
        return res.status(200).json({
          message: 'Login successful',
          redirect: '/SuperAdminDashboard',
        });
      } else {
        return res.status(200).json({
          message: 'Login successful',
          userId: user.userId,
          userRoleid: user.userRoleid,
        });
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
