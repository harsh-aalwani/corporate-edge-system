import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';  // Check the email in User model
import AuthUser from '../models/authUserModel.js';  // Save OTP in AuthUser model
import sendEmail from '../utils/sendEmail.js';

// Generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP to Email
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the user exists in the User model (for email validation)
    const user = await User.findOne({ userEmail: email });
    if (!user) return res.status(400).json({ message: "Email not found!" });

    // If the user exists in User model, proceed to save OTP in AuthUser
    const otp = generateOtp();
    
    // Find the AuthUser model and update OTP
    let authUser = await AuthUser.findOne({ email });
    if (!authUser) {
      authUser = new AuthUser({ email, otp, otpExpiration: Date.now() + 10 * 60 * 1000 });
    } else {
      // If AuthUser exists, just update the OTP and expiration
      authUser.otp = otp;
      authUser.otpExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    }
    
    await authUser.save();
    // Send OTP email
    await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);
    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error!" });
  }
};

// Verify OTP (as a function)
const verifyOtpFunction = async (email, otp) => {
  const authUser = await AuthUser.findOne({
    email,
    otp,
    otpExpiration: { $gt: Date.now() }  // Check if OTP is still valid
  });

  if (!authUser) {
    throw new Error("Invalid or expired OTP!");
  }
  return authUser; // Return the AuthUser if OTP is valid
};

// Reset Password (Calls verifyOtpFunction)
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // Step 1: Verify OTP
    const authUser = await verifyOtpFunction(email, otp);

    // Step 2: Reset Password (With Hashing)
    const user = await User.findOne({ userEmail: email });
    user.userPassword = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Clear OTP and expiration in AuthUser
    authUser.otp = undefined;  
    authUser.otpExpiration = undefined;
    await authUser.save();

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    res.status(400).json({ message: error.message || "Server Error!" });
  }
};
