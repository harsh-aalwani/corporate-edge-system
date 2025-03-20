import Leave from "../models/leaveModel.js";
import { LeaveUsage } from "../models/LeaveBalanceModel.js";

export const getLeaveUsage = async (req, res) => {
  try {
    const employeeId = req.session.userId;
    if (!employeeId) return res.status(401).json({ message: "User not logged in" });
    
    const leaveUsage = await LeaveUsage.getUsedLeaves(employeeId);
    res.status(200).json(leaveUsage);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave usage", error: error.message });
  }
};
