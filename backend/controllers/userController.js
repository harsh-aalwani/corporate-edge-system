// controllers/userController.js
import bcrypt from 'bcryptjs';
import validator from 'validator';
import User from '../models/userModel.js';
import CryptoJS from 'crypto-js';
import { COOKIE_SECRET_KEY } from '../config.js';

export const loginUser = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  // Input validation and sanitization
  if (!userEmail || !userPassword || !validator.isEmail(userEmail)) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const sanitizedEmail = validator.normalizeEmail(userEmail);

  try {
    const user = await User.findOne({ userEmail: sanitizedEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    // Create session
    req.session.userId = user.userId;
    req.session.userRoleid = user.userRoleid;

    // Encrypt the userRoleid
    const encryptedRole = CryptoJS.AES.encrypt(user.userRoleid.toString(), COOKIE_SECRET_KEY).toString();

    // Update user status to online
    user.userStatus = true;
    await user.save();

    // Send encrypted role to frontend
    return res.status(200).json({
      message: 'Login successful',
      encryptedRole: encryptedRole,  // Send encrypted `userRoleid`
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const logoutUser = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user status to offline
    user.userStatus = false;
    await user.save();

    // Clear cookies and destroy session
    res.clearCookie('userId');
    res.clearCookie('roleId');
    req.session.destroy(); // Destroy session

    return res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not logged in' });
    }
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user status to online
    user.userStatus = true;
    await user.save();

    return res.status(200).json({ message: 'User status updated to online' });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const getUserProfile = async (req, res) => {
  try {
      // Check if session contains userId
      if (!req.session.userId) {
          return res.status(401).json({ message: 'Unauthorized. Please log in.' });
      }

      // Find user by userId from session
      const user = await User.findOne({ userId: req.session.userId });

      // If user not found
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      // Send user data (you can send fullName or other user info as needed)
      res.status(200).json({
          data: {
              fullName: user.fullName,
              userEmail: user.userEmail,
              userMobileNumber: user.userMobileNumber,
              userDepartment: user.userDepartment,
              // Include other fields as needed
          }
      });
  } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUserAccess = async (req, res) => {
  if (req.session && req.session.userRoleid) {
    // You can also return more session details if needed
    return res.status(200).json({ userRoleid: req.session.userRoleid });
  }
  res.status(401).json({ message: 'No active session found' });
};
