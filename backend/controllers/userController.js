// controllers/userController.js
import bcrypt from 'bcryptjs';
import validator from 'validator';
import User from '../models/userModel.js';
import UserDetails from "../models/userDetailsModel.js";
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

export const getUserRoles = async (req, res) => {
  try {
    const { userRoleid } = req.session;

    if (!userRoleid) {
      return res.status(401).json({ message: "Not logged in" });
    }

    let availableRoles = [];
    let systemAdminExtra = false; 

    switch (userRoleid) {
      case "R1":
        availableRoles = ["System-Admin", "HR", "Department-Manager", "Employee"];
        systemAdminExtra = true;
        break;

      case "R2":
        // Check userPermissions.SystemAdminExtra from tableUser
        const user = await User.findOne({ userRoleid: "R2" });
        if (user && user.userPermissions.SystemAdminExtra) {
          availableRoles = ["System-Admin", "HR", "Department-Manager", "Employee"];
        } else {
          availableRoles = ["HR", "Department-Manager", "Employee"];
        }
        break;

      case "R3":
        availableRoles = ["Department-Manager", "Employee"];
        break;

      case "R4":
        availableRoles = ["Employee"];
        break;

      default:
        return res.status(403).json({ message: "Unauthorized role" });
    }

    res.status(200).json({ roles: availableRoles, systemAdminExtra });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const createUserWithDetails = async (req, res) => {
  try {
    let {
      fullName, userEmail, userMobileNumber, userRoleid, userDepartment, userDesignation, userPermissions,
      dob, age, nativePlace, nationality, gender, maritalStatus, languagesKnown,
      presentAddress, permanentAddress, educationQualification, specialization,
      lastWorkPlace, yearsOfExperience, addressOfWorkPlace, responsibilities,
      referenceContact, totalYearsOfExperience
    } = req.body;

    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: Please log in first." });
    }

    const createdBy = req.session.userId;

    // ✅ Convert educationQualification string to array
    if (typeof educationQualification === "string") {
      try {
        educationQualification = JSON.parse(educationQualification);
      } catch (error) {
        return res.status(400).json({ message: "Invalid educationQualification format." });
      }
    }

    if (!Array.isArray(educationQualification)) {
      return res.status(400).json({ message: "Education Qualification should be an array." });
    }

    // ✅ Extract file paths
    const identityProof = req.files?.identityProof?.[0]?.path || null;
    const picture = req.files?.picture?.[0]?.path || null;

    // ✅ Convert Role Name to Role ID & Prefix
    let convertedRoleId, rolePrefix;
    switch (userRoleid) {
      case "System-Admin":
        convertedRoleId = "R2";
        rolePrefix = "SY";
        break;
      case "HR":
        convertedRoleId = "R3";
        rolePrefix = "HR";
        break;
      case "Department-Manager":
        convertedRoleId = "R4";
        rolePrefix = "DM";
        break;
      case "Employee":
        convertedRoleId = "R5";
        rolePrefix = "EM";
        break;
      default:
        return res.status(400).json({ message: "Invalid user role selected." });
    }

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ userEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Try a different email." });
    }

    // ✅ Find the last user with the same role to determine the next ID
    const lastUser = await User.findOne({ userRoleid: convertedRoleId })
      .sort({ createdAt: -1 }) // Sort by latest created user
      .lean();

    let nextUserNumber = 1;
    if (lastUser) {
      const lastUserId = lastUser.userId;
      const lastNumberMatch = lastUserId.match(/\d+$/); // Extract numeric part
      if (lastNumberMatch) {
        nextUserNumber = parseInt(lastNumberMatch[0]) + 1; // Increment the number
      }
    }

    // ✅ Generate userId
    const userId = `${rolePrefix}${nextUserNumber}`;

    // ✅ Generate Default Password
    const currentYear = new Date().getFullYear();
    const emailPrefix = userEmail.split("@")[0];
    const rawPassword = `${currentYear}#${emailPrefix}`;

    // ✅ Hash Password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // ✅ Insert into tableUser
    const newUser = await User.create({
      userId,
      fullName,
      userEmail,
      userMobileNumber,
      userStatus: false,
      userPassword: hashedPassword,
      userRoleid: convertedRoleId,
      userDepartment,
      userDesignation,
      userPermissions: {
        SystemAdminExtra: userPermissions?.SystemAdminExtra || false,
      },
      activateAccount: true,
      createdAt: new Date(),
    });

    // ✅ Insert into tableUserDetails
    const newUserDetails = await UserDetails.create({
      userdetailsId: `${userId}-D`,
      userId,
      dob,
      age,
      nativePlace,
      nationality,
      gender,
      maritalStatus,
      languagesKnown,
      identityProof,
      picture,
      presentAddress,
      permanentAddress,
      educationQualification,
      specialization,
      lastWorkPlace,
      yearsOfExperience,
      addressOfWorkPlace,
      responsibilities,
      referenceContact,
      totalYearsOfExperience,
      createdBy,
    });

    res.status(201).json({
      message: "User and details created successfully!",
      user: newUser,
      userDetails: newUserDetails,
      rawPassword,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid data. Please check your inputs." });
    }

    res.status(500).json({ message: "Server error. Please try again later.", error });
  }
};
