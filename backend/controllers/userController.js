import mongoose from "mongoose";

// controllers/userController.js
import bcrypt from 'bcryptjs';
import validator from 'validator';
import User from '../models/userModel.js';
import Announcement from '../models/announcementModel.js';
import UserDetails from "../models/userDetailsModel.js";
import Candidate from "../models/candidateModel.js";
import CryptoJS from 'crypto-js';
import { COOKIE_SECRET_KEY } from '../config.js';
import path from 'path';
import fs from 'fs';
import sendEmail from '../utils/sendEmail.js'
import UserLog from '../models/Log/UserLogModel.js'

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

    // Check if account is activated
    if (!user.activateAccount) {
      return res.status(403).json({
        message: 'Account is not activated. Please contact your administrator.',
      });
    }

    // Check if current time is after accountActivationTime
    if (user.accountActivationTime && new Date(user.accountActivationTime) > new Date()) {
      return res.status(403).json({
        message: 'Account is not activated. Please contact your administrator.',
      });
    }

    // Create session
    req.session.userId = user.userId;
    req.session.userRoleid = user.userRoleid;

    const encryptedRole = CryptoJS.AES.encrypt(
      user.userRoleid.toString(),
      COOKIE_SECRET_KEY
    ).toString();

    // Update user status to online
    user.userStatus = true;
    await user.save();

    // Create login log
    const logId = `${user.userId}-${Date.now()}`;
    await UserLog.create({
      logId,
      userId: user.userId,
      event: 'Login',
    });

    return res.status(200).json({
      message: 'Login successful',
      encryptedRole: encryptedRole,
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

    // Create a logout log entry
    const logId = `${user.userId}-${Date.now()}`;
    await UserLog.create({
      logId,
      userId: user.userId,
      event: "Logout",
    });

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

      // Find user from tableUser
      const user = await User.findOne({ userId: req.session.userId });
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      // Find user details from tableUserDetails
      const userDetails = await UserDetails.findOne({ userId: req.session.userId });

      // Construct response object
      const userProfile = {
          fullName: user.fullName,
          userEmail: user.userEmail,
          userMobileNumber: user.userMobileNumber,
          userDepartment: user.userDepartment,
          userDesignation: user.userDesignation,
          userStatus: user.userStatus,
          activateAccount: user.activateAccount,
          permissions: user.userPermissions,
          createdAt: user.createdAt,

          // Add details from userDetails if available
          dob: userDetails?.dob || null,
          age: userDetails?.age || null,
          nativePlace: userDetails?.nativePlace || null,
          nationality: userDetails?.nationality || null,
          gender: userDetails?.gender || null,
          maritalStatus: userDetails?.maritalStatus || null,
          languagesKnown: userDetails?.languagesKnown || [],
          identityProof: userDetails?.identityProof || null,
          picture: userDetails?.picture || null,
          presentAddress: userDetails?.presentAddress || null,
          permanentAddress: userDetails?.permanentAddress || null,
          educationQualification: userDetails?.educationQualification || [],
          specialization: userDetails?.specialization || null,
          lastWorkPlace: userDetails?.lastWorkPlace || null,
          yearsOfExperience: userDetails?.yearsOfExperience || null,
          totalYearsOfExperience: userDetails?.totalYearsOfExperience || null,
          addressOfWorkPlace: userDetails?.addressOfWorkPlace || null,
          responsibilities: userDetails?.responsibilities || null,
          referenceContact: userDetails?.referenceContact || null,
          // Designation: userDetails?.Designation || null
      };

      res.status(200).json({ data: userProfile });
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
    console.log(userRoleid);
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
    const currentYear = new Date().getFullYear();
    const emailPrefix = userEmail.split("@")[0];
    const rawPassword = `${currentYear}#${emailPrefix}`;
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

    // ✅ Send Email Notification
    const emailSubject = "Welcome to Our System!";
    const emailMessage = `
      Dear ${fullName},

      You have been successfully added to the system with the following credentials:
      
      Email: ${userEmail}
      Password: ${rawPassword}
      
      Please log in and change your password immediately.

      Regards,
      Admin Team
    `;

    const emailSent = await sendEmail(userEmail, emailSubject, emailMessage);

    if (!emailSent) {
      console.error("❌ Email sending failed, but user created successfully.");
      return res.status(201).json({
        message: "User created successfully, but email sending failed.",
        user: newUser,
        userDetails: newUserDetails,
        rawPassword,
      });
    }

    res.status(201).json({
      message: "User and details created successfully! Email sent.",
      user: newUser,
      userDetails: newUserDetails,
      rawPassword,
    });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ message: "Server error. Please try again later.", error });
  }
};

// change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate session
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    // 🔹 Fetch user from the database
    const user = await User.findOne({ userId: req.session.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 🛠 Debugging Logs
    console.log("🔑 Entered Old Password:", oldPassword);
    console.log("🔒 Stored Hashed Password:", user.userPassword);

    // 🔹 Validate old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.userPassword);
    console.log("✅ Password Match:", isOldPasswordValid);

    if (!isOldPasswordValid) {
      return res.status(400).json({ message: "Incorrect old password." });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    user.userPassword = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;

    // Ensure session has userId
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const userId = req.session.userId; // ✅ Get userId from session
    console.log(`🔍 Fetching user with userId: ${userId}`);

    // 🔥 FIX: Use `findOne` instead of `findById` (since `userId` is a string, not an ObjectId)
    const user = await User.findOne({ userId }); 

    if (!user) {
      console.log(`❌ User not found for ID: ${userId}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log(`🔍 Found user: ${userId}, Hashed Password: ${user.userPassword}`);

    // Compare input password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.userPassword);
    console.log(`🔍 Password Match: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    res.status(200).json({ success: true, message: "Password verified successfully" });

  } catch (error) {
    console.error("❌ Error verifying password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newPicturePath = `uploads/userPictures/${req.file.filename}`; // New image path

    // Find existing user details to get the old picture path
    const userDetails = await UserDetails.findOne({ userId });

    if (userDetails && userDetails.picture) {
      const oldPicturePath = path.join(process.cwd(), userDetails.picture);

      // Check if the old file exists and delete it
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update the user with the new picture
    const updatedUserDetails = await UserDetails.findOneAndUpdate(
      { userId: userId },
      { picture: newPicturePath },
      { new: true }
    );

    res.json({ message: "Profile picture updated successfully", picture: newPicturePath });
    console.log("Profile Picture Updated:", newPicturePath);
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();  // Get all users
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsersSafe = async (req, res) => {
  try {
    const users = await User.find({}, "userId fullName userRoleid userDepartment userDesignation userStatus");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from URL

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Query by userId (not _id)
    const user = await User.findOne({ userId: id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllUserDetails = async (req, res) => {
  try {
    const userDetails = await UserDetails.find();
    res.json({ userDetails });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserDetailsById = async (req, res) => {
  try {
    const { id } = req.params; // Extract user ID from URL

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch user details based on userId
    const userDetails = await UserDetails.findOne({ userId: id });

    if (!userDetails) {
      return res.status(404).json({ message: "User details not found" });
    }
    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUserWithDetails = async (req, res) => {
  try {
    let {
      id, // current userId from the request – used to locate the user record
      firstName,
      fatherName,
      surName,
      email,        // front-end field, maps to userEmail
      phone,        // front-end field, maps to userMobileNumber
      userRoleid,
      department,   // front-end field, maps to userDepartment
      userDesignation,
      userPermissions,
      dob,
      age,
      nativePlace,
      nationality,
      gender,
      maritalStatus,
      languagesKnown,  // may be comma-separated
      presentAddress,
      permanentAddress,
      educationQualification,
      specialization,
      lastWorkPlace,
      yearsOfExperience,
      addressOfWorkPlace,
      responsibilities,
      referenceContact,
      totalYearsOfExperience
    } = req.body;

    // Map front-end keys to backend keys
    const userEmail = email;
    const userMobileNumber = phone;
    // We'll handle userDepartment update with a non-empty check below.

    // Combine names to form fullName
    const fullName = `${firstName} ${fatherName} ${surName}`.trim();

    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: Please log in first." });
    }

    // Convert dob from "DD/MM/YYYY" to a Date object if needed
    if (typeof dob === "string") {
      const parts = dob.split("/");
      if (parts.length === 3) {
        dob = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }

    // Parse educationQualification if it's sent as a string
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

    // Convert languagesKnown from a comma-separated string into an array if necessary
    if (typeof languagesKnown === "string") {
      languagesKnown = languagesKnown.split(",").map(lang => lang.trim());
    }

    // Determine convertedRoleId and rolePrefix based on the provided userRoleid
    let convertedRoleId, rolePrefix;
    switch (userRoleid) {
      case "System-Admin": convertedRoleId = "R2"; rolePrefix = "SY"; break;
      case "HR": convertedRoleId = "R3"; rolePrefix = "HR"; break;
      case "Department-Manager": convertedRoleId = "R4"; rolePrefix = "DM"; break;
      case "Employee": convertedRoleId = "R5"; rolePrefix = "EM"; break;
      default:
        return res.status(400).json({ message: "Invalid user role selected." });
    }

    // Check if the new email is already registered to another user
    const emailExists = await User.findOne({ userEmail, userId: { $ne: id } });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered. Try a different email." });
    }

    // Find the existing user record in the user table
    const existingUser = await User.findOne({ userId: id });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    let newUserId = existingUser.userId;
    if (convertedRoleId !== existingUser.userRoleid) {
      let isUnique = false;
      let nextUserNumber = 1;
      let tentativeUserId;
    
      while (!isUnique) {
        tentativeUserId = `${rolePrefix}${nextUserNumber}`;
    
        const existingWithId = await User.findOne({ userId: tentativeUserId });
        if (!existingWithId) {
          isUnique = true;
        } else {
          nextUserNumber++;
        }
      }
    
      newUserId = tentativeUserId;
    }
    
    // Update the User (usertable) fields
    existingUser.fullName = fullName;
    existingUser.userEmail = userEmail; // update email if changed
    existingUser.userMobileNumber = userMobileNumber ?? existingUser.userMobileNumber;
    // Ensure userDepartment is not updated with an empty string:
    existingUser.userDepartment = 
      (department && department.trim() !== "") ? department : existingUser.userDepartment;
    existingUser.userRoleid = convertedRoleId;
    existingUser.userDesignation = userDesignation ?? existingUser.userDesignation;
    existingUser.userPermissions = {
      SystemAdminExtra: userPermissions?.SystemAdminExtra ?? existingUser.userPermissions.SystemAdminExtra,
    };

    // If a new userId was generated (role change), update it
    if (newUserId !== existingUser.userId) {
      const oldUserId = existingUser.userId;
      existingUser.userId = newUserId;
      await existingUser.save();

      // Also update the UserDetails record in the user detail table for the old userId
      const userDetailsByOldId = await UserDetails.findOne({ userId: oldUserId });
      if (userDetailsByOldId) {
        userDetailsByOldId.userId = newUserId;
        userDetailsByOldId.userdetailsId = `${newUserId}-D`;
        await userDetailsByOldId.save();
      }
    } else {
      await existingUser.save();
    }

    // Update or create the UserDetails record in the user detail table using the updated userId (newUserId)
    let existingUserDetails = await UserDetails.findOne({ userId: newUserId });
    if (!existingUserDetails) {
      existingUserDetails = await UserDetails.create({
        userdetailsId: `${newUserId}-D`,
        userId: newUserId,
        dob,
        age,
        nativePlace,
        nationality,
        gender,
        maritalStatus,
        languagesKnown,
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
        createdBy: req.session.userId,
      });
    } else {
      Object.assign(existingUserDetails, {
        dob,
        age,
        nativePlace,
        nationality,
        gender,
        maritalStatus,
        languagesKnown,
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
      });
      await existingUserDetails.save();
    }

    res.status(200).json({
      message: "User and details updated successfully!",
      user: existingUser,
      userDetails: existingUserDetails,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Server error. Please try again later.", error });
  }
};


export const getUserInfoAndExperience = async (req, res) => {
  try {
    const users = await User.aggregate([
      { $match: { activateAccount: true } }, // ✅ Only active users
      {
        $lookup: {
          from: "tableUserDetails",
          localField: "userId",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          yearsSinceCreation: {
            $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24 * 365],
          },
          totalExperience: {
            $add: [
              { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24 * 365] },
              { $ifNull: ["$userDetails.totalYearsOfExperience", 0] },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          fullName: 1,
          userDepartment: 1,
          createdAt: 1,
          totalYearsOfExperience: "$userDetails.totalYearsOfExperience",
          totalExperience: 1,
        },
      },
    ]);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const evaluatorsLogin = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  // Validate email and password
  if (!userEmail || !userPassword || !validator.isEmail(userEmail)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const sanitizedEmail = validator.normalizeEmail(userEmail);

  try {
    // ✅ Step 1: Check User Details
    const user = await User.findOne({ userEmail: sanitizedEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    console.log("Checking for userId:", user.userId); // Debugging

    // ✅ Step 2: Check If User is Assigned to Any Active Announcements
    const isAssigned = await Announcement.exists({
      concluded: false,
      assignedEvaluators: { $in: [user.userId] }, // ✅ Ensures `userId` is matched in the array
    });

    if (!isAssigned) {
      return res.status(403).json({ message: "Not assigned to any evaluation" });
    }

    // ✅ Step 3: Create Session for Evaluator
    req.session.userId = user.userId;
    req.session.userRoleid = user.userRoleid;

    // ✅ Step 4: Encrypt Role
    const encryptedRole = CryptoJS.AES.encrypt(user.userRoleid.toString(), COOKIE_SECRET_KEY).toString();

    // ✅ Step 5: Update User Status & Save
    user.userStatus = true;
    await user.save();

    return res.status(200).json({
      message: "Login successful",
      encryptedRole: encryptedRole,
    });
  } catch (error) {
    console.error("Error during evaluator login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ✅ Define role mapping outside to avoid re-initialization
const roleMapping = {
  "System-Admin": { id: "R2", prefix: "SY" },
  "HR": { id: "R3", prefix: "HR" },
  "Department-Manager": { id: "R4", prefix: "DM" },
  "Employee": { id: "R5", prefix: "EM" },
};

export const createUsersFromCandidates = async (req, res) => {
  console.log("📌 Processing candidate conversion...");
  console.log("Received data:", req.body);

  try {
    const userEmail = req.body.userEmail;
    if (!userEmail) {
      return res.status(400).json({ message: "User email is required." });
    }

    // ✅ Fetch candidate for picture & documents only
    const candidate = await Candidate.findOne({ email: userEmail });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    // ✅ Role + userId generation
    const roleInfo = roleMapping[req.body.userRoleid] || {};
    if (!roleInfo.id) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const lastUser = await User.findOne({ userRoleid: roleInfo.id }).sort({ createdAt: -1 }).lean();
    const nextUserNumber = lastUser ? parseInt(lastUser.userId.match(/\d+$/)[0]) + 1 : 1;
    const userId = `${roleInfo.prefix}${nextUserNumber}`;

    // ✅ Password generation and hashing
    const rawPassword = `${new Date().getFullYear()}#${userEmail.split("@")[0]}`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // ✅ Full Name formatting
    const fullName = `${req.body.fullName || ""}`.trim();

    // ✅ Construct User
    const newUser = {
      userId,
      fullName,
      userEmail,
      userMobileNumber: req.body.userMobileNumber,
      userStatus: false,
      userPassword: hashedPassword,
      userRoleid: roleInfo.id,
      userDepartment: req.body.userDepartment,
      userDesignation: req.body.userDesignation || "N/A",
      userPermissions: req.body.userPermissions || { SystemAdminExtra: false },
      activateAccount: true,
      accountActivationTime: req.body.accountActivationTime
        ? new Date(req.body.accountActivationTime)
        : new Date(),
      createdAt: new Date(),
    };

    // ✅ Format language array if string (fallback)
    const formattedLanguages = Array.isArray(req.body.languagesKnown)
      ? req.body.languagesKnown
      : (req.body.languagesKnown || "").split(",").map(lang => lang.trim());

    // ✅ Construct UserDetails
    const newUserDetails = {
      userdetailsId: `${userId}-D`,
      userId,
      dob: new Date(req.body.dob),
      age: req.body.age || null,
      nativePlace: req.body.nativePlace,
      nationality: req.body.nationality,
      gender: req.body.gender,
      maritalStatus: req.body.maritalStatus,
      languagesKnown: formattedLanguages,
      presentAddress: req.body.presentAddress,
      permanentAddress: req.body.permanentAddress,
      educationQualification: req.body.educationQualification || [],
      specialization: req.body.specialization,
      lastWorkPlace: req.body.lastWorkPlace,
      yearsOfExperience: req.body.yearsOfExperience,
      addressOfWorkPlace: req.body.addressOfWorkPlace,
      responsibilities: req.body.responsibilities,
      referenceContact: req.body.referenceContact,
      totalYearsOfExperience: req.body.totalYearsOfExperience,
      createdBy: req.session.userId,
      identityProof: candidate.candidateDocuments || "",
      picture: candidate.candidatePicture || "",
    };

    // ✅ Insert into DB
    await User.create(newUser);
    await UserDetails.create(newUserDetails);

    // ✅ Update Candidate Status
    await Candidate.updateOne(
      { email: userEmail },
      {
        $set: {
          recruited: true,
          confirmationStatus: "Hired",
        },
      }
    );

    // ✅ Send Email Notification
    const emailSubject = "Welcome to Our System!";
    const emailMessage = `
      Dear ${newUser.fullName},

      You have been successfully added to the system with the following credentials:

      Email: ${userEmail}
      Password: ${rawPassword}

      Please log in and change your password immediately.

      Regards,
      Admin Team
    `;

    const emailSent = await sendEmail(userEmail, emailSubject, emailMessage);

    if (!emailSent) {
      console.error("❌ Email sending failed, but user created successfully.");
      return res.status(201).json({
        message: "User created, but email sending failed.",
        user: newUser,
        userDetails: newUserDetails,
        rawPassword,
      });
    }

    console.log(`🎉 Successfully inserted user ${userId} and updated candidate status`);
    return res.status(201).json({
      message: "Candidate converted to user successfully, and email sent!",
      documentPath: candidate.candidateDocuments,
      picturePath: candidate.candidatePicture,
    });

  } catch (error) {
    console.error("❌ Error processing candidate:", error);
    return res.status(500).json({ message: "Server error while processing candidate." });
  }
};

export const getUserLogs = async (req, res) => {
  try {
    // Extract query parameters with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || "timestamp";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const event = req.query.event; // e.g., "Login" or "Logout"

    const skip = (page - 1) * limit;

    // Build a query object. If an event filter is provided, include it.
    let query = {};
    if (event) {
      query.event = event;
    }

    // Count the total number of logs that match the filter
    const totalLogs = await UserLog.countDocuments(query);

    // Fetch logs with sorting and pagination
    const logs = await UserLog.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Return logs along with pagination metadata
    res.status(200).json({
      logs,
      totalLogs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
