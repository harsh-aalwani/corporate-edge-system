import axios from 'axios';
import User from '../models/userModel.js';  // Import the User model
import Department from '../models/departmentsModel.js';
import Policy from '../models/policyModel.js';
import Leave from "../models/leaveModel.js";
import EmployeeAppraisalModel from '../models/EmployeeAppraisalModel.js';
import concernModel from '../models/concernModel.js';
import Announcement from '../models/announcementModel.js';
import UserLogModel from '../models/Log/UserLogModel.js';
import { LeaveAllocation } from "../models/leaveAllocationModel.js"; // ✅ Fix: Import LeaveAllocation
import { CAPTCHA_SECRET } from "../config.js";

export const getSystemAdmin = async (req, res) => {
  try {
    const systemAdmin = await User.find({ userRoleid: 'R2' });

    if (!systemAdmin.length) {
      return res.status(404).json({ message: 'no System Admin Found' });
    }

    return res.status(200).json({ systemAdmin });
  } catch (error) {
    console.error('Error fetching HR Managers:', error.message);
    return res.status(500).json({ message: 'Error fetching HR Managers' });
  }
};

// Controller to get HR Managers (RoleID = 'R3')
export const getHRManagers = async (req, res) => {
  try {
    const hrManagers = await User.find({ userRoleid: 'R3' });

    if (!hrManagers.length) {
      return res.status(404).json({ message: 'No HR Managers found' });
    }

    return res.status(200).json({ hrManagers });
  } catch (error) {
    console.error('Error fetching HR Managers:', error.message);
    return res.status(500).json({ message: 'Error fetching HR Managers' });
  }
};

export const getDeptManager = async (req, res) => {
  try {
    const deptManager = await User.find({ userRoleid: 'R4' });

    if (!deptManager.length) {
      return res.status(404).json({ message: 'No Deparment Manager Found' });
    }

    return res.status(200).json({ deptManager });
  } catch (error) {
    console.error('Error fetching Department Manager:', error.message);
    return res.status(500).json({ message: 'Error fetching Department Manager' });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const employees = await User.find({ userRoleid: 'R5' });

    if (!employees.length) {
      return res.status(404).json({ message: 'No Employee Found' });
    }

    return res.status(200).json({ employees });
  } catch (error) {
    console.error('Error fetching Employess:', error.message);
    return res.status(500).json({ message: 'Error fetching Employess' });
  }
};


export const getAllCounts = async (req, res) => {
  try {
      const [
          totalUsers, 
          activeUsers, 
          departmentCount, 
          policyCount, 
          pendingLeaveCount, 
          jobVacancyCount // ✅ Added job vacancy count
      ] = await Promise.all([
          User.countDocuments(),
          User.countDocuments({ userStatus: true }),
          Department.countDocuments(),
          Policy.countDocuments(),
          Leave.countDocuments({ status: "Pending" }),
          Announcement.countDocuments({ concluded: false }) // ✅ Only count open job vacancies
      ]);
      setTimeout(() => { // ⏳ Delay before sending response
          res.json({ 
              totalUsers, 
              activeUsers, 
              departmentCount, 
              policyCount, 
              pendingLeaveCount, 
              jobVacancyCount // ✅ Include in response
          });
      }, 500);

  } catch (error) {
      console.error("❌ Error fetching counts:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};


export const historyData = async (req, res) => {
  try {
    // Get userId from session
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user session" });
    }

    // Fetch latest actions from each collection
    const actions = await Promise.all([
      User.findOne({ createdBy: userId }).sort({ createdAt: -1 }).select("createdAt _id"),
      Leave.findOne({ employeeId: userId }).sort({ createdAt: -1 }).select("createdAt _id leaveName"),
      EmployeeAppraisalModel.findOne({ createdBy: userId }).sort({ createdAt: -1 }).select("createdAt _id status"),
      concernModel.findOne({ userId }).sort({ createdAt: -1 }).select("createdAt _id subject"),
      Announcement.findOne({ createdBy: userId }).sort({ createdAt: -1 }).select("createdAt _id announcementTitle"),
      UserLogModel.findOne({ userId }).sort({ timestamp: -1 }).select("timestamp _id event"),
    ]);

    // Format history data with meaningful messages
    const history = actions
      .filter(Boolean) // Remove null values
      .map((action) => {
        let message = "Activity recorded";
        let date = action.createdAt || action.timestamp;

        if (action.leaveName) {
          message = `Leave request submitted: ${action.leaveName}`;
        } else if (action.status) {
          message = `Employee Appraisal marked as ${action.status}`;
        } else if (action.subject) {
          message = `Concern raised: ${action.subject}`;
        } else if (action.announcementTitle) {
          message = `New Announcement: ${action.announcementTitle}`;
        } else if (action.event) {
          message = `User ${action.event}`;
        }

        return {
          id: action._id,
          date,
          event: message,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by latest date
      .slice(0, 3); // Get last 3 actions

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserLeaveBalances = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: No session found" });
    }

    const employeeId = req.session.userId; // ✅ Get logged-in user's ID

    // ✅ Fetch all leave allocations
    const leaveAllocations = await LeaveAllocation.find({}, "leaveId leaveName leaveNumber");

    // ✅ Fetch taken leaves where status is "Approved" or "Completed"
    const leaveTaken = await Leave.aggregate([
      {
        $match: {
          employeeId,
          status: { $in: ["Approved", "Completed"] },
        },
      },
      {
        $group: {
          _id: "$leaveName",
          totalTaken: { $sum: 1 }, // Adjust if leave duration is needed
        },
      },
    ]);

    // ✅ Convert taken leaves into a lookup map
    const leaveTakenMap = {};
    leaveTaken.forEach(({ _id, totalTaken }) => {
      leaveTakenMap[_id] = totalTaken;
    });

    // ✅ Prepare response with remaining leaves
    const leaveBalances = leaveAllocations.map((leave) => ({
      leaveId: leave.leaveId,
      leaveName: leave.leaveName,
      totalAllocated: leave.leaveNumber,
      totalTaken: leaveTakenMap[leave.leaveName] || 0,
      remainingLeaves: Math.max(leave.leaveNumber - (leaveTakenMap[leave.leaveName] || 0), 0), // Avoid negative
    }));

    res.status(200).json(leaveBalances);
  } catch (error) {
    console.error("❌ Error fetching leave balances:", error);
    res.status(500).json({ message: "Failed to fetch leave balances." });
  }
};


export const toggleSystemAdminStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { activateAccount } = req.body;

    console.log("Request received:", { userId, activateAccount });

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.activateAccount = activateAccount;  // ✅ use the correct field
    await user.save();

    res.status(200).json({ message: "User status updated successfully" });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ message: "Failed to update user status" });
  }
};

export const toggleHRManagerStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { activateAccount } = req.body;

    console.log("Request received for HR Manager:", { userId, activateAccount });

    const hrManager = await User.findOne({ userId });
    if (!hrManager) {
      return res.status(404).json({ message: "HR Manager not found" });
    }

    // Update activation status using the User model
    hrManager.activateAccount = activateAccount;
    await hrManager.save();

    res.status(200).json({ message: "HR Manager status updated successfully" });
  } catch (error) {
    console.error("Toggle HR Manager status error:", error);
    res.status(500).json({ message: "Failed to update HR Manager status" });
  }
};

export const toggleDepartmentManagerStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { activateAccount } = req.body;

    console.log("Request received for Department Manager:", { userId, activateAccount });

    const deptManager = await User.findOne({ userId });
    if (!deptManager) {
      return res.status(404).json({ message: "Department Manager not found" });
    }

    // Update activation status using the User model
    deptManager.activateAccount = activateAccount;
    await deptManager.save();

    res.status(200).json({ message: "Department Manager status updated successfully" });
  } catch (error) {
    console.error("Toggle Department Manager status error:", error);
    res.status(500).json({ message: "Failed to update Department Manager status" });
  }
};

// In manageControllers.js (or your appropriate controller file)
export const toggleEmployeeStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { activateAccount } = req.body;

    console.log("Request received for Employee:", { userId, activateAccount });

    const employee = await User.findOne({ userId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update activation status using the User model
    employee.activateAccount = activateAccount;
    await employee.save();

    res.status(200).json({ message: "Employee status updated successfully" });
  } catch (error) {
    console.error("Toggle Employee status error:", error);
    res.status(500).json({ message: "Failed to update Employee status" });
  }
};

export const verifyCaptcha = async (req, res) => {
  console.log("Request body:", req.body); // Debug log

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: "Missing CAPTCHA token" });
  }

  try {
    const captchaRes = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: CAPTCHA_SECRET,
          response: token,
        },
      }
    );

    console.log("Google CAPTCHA response:", captchaRes.data); // Debug log

    if (captchaRes.data.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "CAPTCHA validation failed" });
    }
  } catch (err) {
    console.error("CAPTCHA verification error:", err);
    res.status(500).json({ success: false, message: "Error verifying CAPTCHA" });
  }
};
