import { LeaveAllocation } from "../models/leaveAllocationModel.js";


// Function to generate custom Leave ID
const generateLeaveId = async () => {
  const lastLeave = await LeaveAllocation.findOne().sort({ leaveId: -1 });
  if (!lastLeave || !lastLeave.leaveId) {
    return "LA1";
  }
  const lastIdNumber = parseInt(lastLeave.leaveId.replace("LA", "")) || 0;
  return `LA${lastIdNumber + 1}`;
};



export const addLeaveAllocation = async (req, res) => {
  try {
    const { leaveName, leaveNumber, leaveDescription, leaveValidFrom, leaveValidTo, leaveYearlyRefresh, isPaidLeave } = req.body;

    if (!leaveName || !leaveNumber || !leaveDescription) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const leaveId = await generateLeaveId(); // ✅ Uses the fixed function

    const newLeave = new LeaveAllocation({
      leaveId,
      leaveName,
      leaveNumber,
      leaveDescription,
      leaveValidFrom,
      leaveValidTo,
      leaveYearlyRefresh,
      isPaidLeave,
    });

    await newLeave.save();
    res.status(201).json({ message: "Leave Allocation added successfully", leaveId });
  } catch (error) {
    console.error("Error Adding Leave Allocation:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};




// Get All Leave Allocations
export const getLeaveAllocations = async (req, res) => {
  try {
    const leaves = await LeaveAllocation.find();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leave allocations" });
  }
};

// Get Leave Allocation by ID
export const getLeaveById = async (req, res) => {
  try {
    const { leaveId } = req.params; // ✅ Fix: Get ID from params instead of body
    if (!leaveId) return res.status(400).json({ message: "Leave ID is required" });

    const leave = await LeaveAllocation.findOne({ leaveId });
    if (!leave) return res.status(404).json({ message: "Leave Allocation not found" });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leave allocation" });
  }
};


// Update Leave Allocation
export const updateLeaveAllocation = async (req, res) => {
  try {
    const {
      leaveId,
      leaveName,
      leaveNumber,
      leaveDescription,
      leaveValidFrom,
      leaveValidTo,
      leaveYearlyRefresh,
      isPaidLeave
    } = req.body;

    if (!leaveId) return res.status(400).json({ message: "Leave ID is required" });

    const updatedLeave = await LeaveAllocation.findOneAndUpdate(
      { leaveId },
      {
        $set: {
          leaveName,
          leaveNumber,
          leaveDescription,
          leaveValidFrom,
          leaveValidTo,
          leaveYearlyRefresh,
          isPaidLeave
        }
      },
      { new: true }
    );

    if (!updatedLeave) return res.status(404).json({ message: "Leave Allocation not found" });

    res.json({ message: "Leave Allocation updated successfully", updatedLeave });
  } catch (error) {
    res.status(500).json({ message: "Failed to update leave allocation", error: error.message });
  }
};


// Delete Leave Allocation
export const deleteLeaveAllocations = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ message: "No IDs provided" });

    await LeaveAllocation.deleteMany({ leaveId: { $in: ids } });
    res.json({ message: "Leave Allocations deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete leave allocations" });
  }
};
