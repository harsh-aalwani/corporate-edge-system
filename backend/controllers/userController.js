// controllers/userController.js
import bcrypt from 'bcryptjs';
import validator from 'validator';
import User from '../models/userModel.js';

export const loginUser = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  if (!userEmail || !userPassword) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!validator.isEmail(userEmail)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const sanitizedEmail = validator.normalizeEmail(userEmail);

  try {
    const user = await User.findOne({ userEmail: sanitizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update user status to online
    user.userStatus = true;
    await user.save();

    // Set cookies for userId and userRoleid
    res.cookie('userId', user.userId, {
      secure: false,  // Set to false for local development (HTTPS not used)
      sameSite: 'Strict', // Prevent CSRF attacks
      maxAge: 24 * 60 * 60 * 1000 // Cookie expiry set to 1 day
    });

    res.cookie('userRoleid', user.userRoleid, {
      secure: false, // Only in development
      sameSite: 'Strict', 
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    
    console.log(req.cookies.userId);
    return res.status(200).json({
      message: 'Login successful',
      userId: user.userId,
      userRoleid: user.userRoleid,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.cookies.userId || req.body.userId; // Support cookies or body payload
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

    // Clear cookies (optional for manual logout)
    res.clearCookie('userId');
    res.clearCookie('roleId');

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
    // Retrieve the userId from the cookie
    const userId = req.cookies.userId; 

    console.log(req.cookies.userId);
    // If userId does not exist in cookies, return an error response
    if (!userId) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    // Fetch the user from the database using the userId as a string
    const user = await User.findOne({ userId: userId });
    console.log(user);
    // If no user is found, return an error response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user's full name
    res.status(200).json({ fullName: user.fullName , userEmail: user.userEmail });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

