import Leave from "../models/leaveModel.js";
import User from "../models/userModel.js";
import { LeaveUsage } from "../models/LeaveBalanceModel.js";
import { LeaveAllocation } from "../models/leaveAllocationModel.js"; // ✅ Fix: Import LeaveAllocation
import sendEmail from "../utils/sendEmail.js"; // ✅ Ensure email utility is imported

export const applyLeave = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "User not logged in" });
    }

    // 🔹 Fetch user details
    const user = await User.findOne({ userId: req.session.userId }).select(
      "fullName userEmail userDepartment userDesignation userId"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Generate Leave ID (LE1, LE2, ...)
    const lastLeave = await Leave.findOne().sort({ createdAt: -1 });

    let newNumber = 1;
    if (lastLeave && lastLeave.leaveId) {
      const lastNumber = parseInt(lastLeave.leaveId.replace("LE", ""), 10);
      if (!isNaN(lastNumber)) {
        newNumber = lastNumber + 1;
      }
    }
    const leaveId = `LE${newNumber}`;

    const { type, startDate, endDate, reason, halfDay, halfDayTime, fullDay } =
      req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const leaveDays =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;

    // 🔹 Find leave allocation using `leaveName`
    const allocation = await LeaveAllocation.findOne({ leaveName: type });

    if (!allocation)
      return res
        .status(404)
        .json({ message: `Leave type '${type}' not found` });

    // ✅ Check if user has enough leave balance
    if (allocation.leaveNumber < leaveDays) {
      return res.status(400).json({
        message: `Not enough leave balance. Available: ${allocation.leaveNumber}, Required: ${leaveDays}`,
      });
    }

    // 🔹 Save leave request with `type: allocation.leaveId`
    const newLeave = new Leave({
      leaveId,
      employeeId: user.userId,
      employeeName: user.fullName,
      employeeEmail: user.userEmail,
      employeeDepartment: user.userDepartment,
      employeeDesignation: user.userDesignation,
      type: allocation.leaveId, // ✅ Store leaveId instead of ObjectId
      leaveName: allocation.leaveName, // ✅ Store leave name correctly
      startDate,
      endDate,
      reason,
      halfDay,
      halfDayTime,
      fullDay,
      status: "Pending",
    });

    await newLeave.save();

    // 🔹 Update LeaveUsage with `leaveId`
    let leaveUsage = await LeaveUsage.findOne({
      employeeId: user.userId,
      type: allocation.leaveId,
    });

    if (!leaveUsage) {
      leaveUsage = new LeaveUsage({
        employeeId: user.userId,
        type: allocation.leaveId, // ✅ Store leaveId instead of ObjectId
        used: leaveDays,
      });
    } else {
      leaveUsage.used += leaveDays;
    }

    await leaveUsage.save();

    res.status(201).json({
      message: `Leave application submitted successfully with ID: ${leaveId}`,
      leaveId,
      leaveType: allocation.leaveName, // ✅ Return proper leave type name
    });
  } catch (error) {
    console.error("🔥 Error in applyLeave:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ message: "Remarks are required" });
    }

    console.log("Received Request to Approve Leave ID:", leaveId); // ✅ Debugging

    // ✅ Ensure leaveId format is correct
    if (!leaveId || typeof leaveId !== "string") {
      console.log("Invalid Leave ID:", leaveId);
      return res.status(400).json({ message: "Invalid Leave ID" });
    }

    // Find the leave request by leaveId
    const leave = await Leave.findOne({ leaveId });

    if (!leave) {
      console.log("Leave request not found for ID:", leaveId); // ✅ Debugging
      return res.status(404).json({ message: "Leave request not found" });
    }

    console.log(`Found Leave Request for ${leave.employeeName}:`, leave);

    // ✅ Check if leave is already approved
    if (leave.status === "Approved") {
      return res
        .status(400)
        .json({ message: "Leave has already been approved" });
    }

    // ✅ Check if leave is already rejected
    if (leave.status === "Rejected") {
      return res
        .status(400)
        .json({ message: "This leave request was already rejected" });
    }

    // Update leave status & save in database
    leave.status = "Approved";
    leave.remarks = remarks;
    await leave.save();

    console.log(`Leave for ${leave.employeeName} approved successfully`);

    // Send Email Notification
    const subject = "Your Leave Request Has Been Approved";
    const message = `Dear ${leave.employeeName},\n\nYour leave request from ${leave.startDate} to ${leave.endDate} has been approved.\n\nRemarks: ${remarks}\n\nBest Regards,\nYour Company`;

    try {
      await sendEmail(leave.employeeEmail, subject, message);
      console.log(`Approval email sent to ${leave.employeeEmail}`);
    } catch (emailError) {
      console.error("Failed to send email:", emailError.message);
    }

    res
      .status(200)
      .json({ message: "Leave approved successfully, and email sent" });
  } catch (error) {
    console.error("Error Approving Leave:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: No session found" });
    }

    // Fetch user details using userId from session
    const user = await User.findOne({ userId: req.session.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Check if user has the required role (R4)
    if (user.userRoleid !== "R4") {
      return res.status(403).json({ message: "Forbidden: Access restricted to HR only" });
    }

    const userDepartment = user.userDepartment; // ✅ Get user's department

    console.log("Fetching leave requests for department:", userDepartment);

    // Fetch leave requests for users in the same department
    const leaveRequests = await Leave.find({ employeeDepartment: userDepartment }).sort({ createdAt: -1 });

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ message: "Error fetching leave requests", error: error.message });
  }
};


export const getLeaveRequestsForManagers = async (req, res) => {
  try {
    // ✅ Fetch all users with roles R3 (Department Manager) or R4 (HR Manager)
    const managers = await User.find({ userRoleid: { $in: ["R3", "R4"] } }, "userDepartment");

    if (!managers.length) {
      return res.status(404).json({ message: "No managers found" });
    }

    // Extract unique department names
    const departments = [...new Set(managers.map((m) => m.userDepartment))];

    console.log("Fetching leave requests for departments:", departments);

    // ✅ Fetch leave requests for employees in the found departments
    const leaveRequests = await Leave.find({ employeeDepartment: { $in: departments } }).sort({ createdAt: -1 });

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ message: "Error fetching leave requests", error: error.message });
  }
};

// Approve Leave Request

// Reject Leave Request
export const rejectLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { remarks } = req.body;
    if (!remarks)
      return res.status(400).json({ message: "Remarks are required" });

    const leave = await Leave.findOne({ leaveId });
    if (!leave)
      return res.status(404).json({ message: "Leave request not found" });

    leave.status = "Rejected";
    leave.remarks = remarks;
    await leave.save();

    const subject = "Your Leave Request Has Been Rejected";
    const message = `Dear ${leave.employeeName},\n\nWe regret to inform you that your leave request from ${leave.startDate} to ${leave.endDate} has been rejected.\n\nRemarks: ${remarks}\n\nRegards,\nYour Company`;

    await sendEmail(leave.employeeEmail, subject, message);
    res.status(200).json({ message: "Leave rejected and email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//display leave

// Get All Leaves or Search by Department
export const getLeaves = async (req, res) => {
  try {
    const { department } = req.query;
    let query = {};
    if (department) {
      query.employeeDepartment = { $regex: department, $options: "i" };
    }

    // Sorting by ascending order of `createdAt`
    const leaves = await Leave.find(
      query,
      "leaveId employeeDepartment employeeName type startDate endDate reason status remarks"
    ).sort({ createdAt: -1 }); // 1 for ascending order

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves", error });
  }
};

// Get Leave by ID
export const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findOne({ leaveId: req.params.id });
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave", error });
  }
};

export const getLeaveUsage = async (req, res) => {
  try {
    const employeeId = req.session.userId;
    if (!employeeId) {
      return res.status(401).json({ message: "User not logged in" });
    }

    const leaveUsage = await LeaveUsage.getUsedLeaves(employeeId);

    res.status(200).json(
      leaveUsage.map(({ type, used }) => ({
        type,
        used: Math.max(0, used), // ✅ Ensure used leaves are never negative
      }))
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leave usage", error: error.message });
  }
};

//withdraw
import tableLeave from "../models/leaveModel.js"; // ✅ Import the correct model
export const getUserWithdrawRequests = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not logged in" });
    }

    // ✅ Fetch only the logged-in user's withdrawable leave requests
    const withdrawRequests = await Leave.find({
      employeeId: userId,
      status: { $in: ["Approved", "Withdraw Pending", "Withdrawn"] },
    }).sort({ createdAt: -1 });

    res.status(200).json(withdrawRequests);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching withdraw leave requests",
        error: error.message,
      });
  }
};
export const getAllUserLeaves = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not logged in" });
    }

    // ✅ Fetch all leave requests for the logged-in user, including rejected ones
    const leaveRequests = await Leave.find({ employeeId: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error("Error fetching user leaves:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const requestWithdrawLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    console.log(`🔍 Checking leave request in tableLeave for ID: ${leaveId}`);

    const leave = await tableLeave.findOne({ leaveId }); // ✅ Use 'tableLeave' directly

    if (!leave) {
      console.error(`❌ No leave found in tableLeave with ID: ${leaveId}`);
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "Approved") {
      return res
        .status(400)
        .json({ message: "Only approved leaves can be withdrawn" });
    }

    leave.status = "Withdrawn";
    await leave.save();

    console.log(`✅ Withdrawal request submitted for leave ID: ${leaveId}`);
    res.status(200).json({ message: "Withdraw request submitted" });
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
