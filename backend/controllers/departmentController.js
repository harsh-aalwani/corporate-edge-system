// controllers/departmentController.js
import Department from "../models/departmentsModel.js";
import DepartmentLog from "../models/Log/departmentLogModel.js";
import User from "../models/userModel.js";

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const { departmentIds } = req.body; // Receive array of department IDs
    if (!departmentIds || !departmentIds.length) {
      return res.status(400).json({ message: "At least one department ID is required" });
    }
    // Fetch multiple departments based on the provided department IDs
    const departments = await Department.find({ departmentid: { $in: departmentIds } });
    if (!departments.length) {
      return res.status(404).json({ message: "No departments found" });
    }
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { departmentName, departmentDescription } = req.body;
    if (!departmentName || !departmentDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure userId is retrieved properly
    const userId = req.session?.userId || req.body.userId; // Fallback to req.body.userId if session is unavailable
    console.log(userId);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
      // console.log(userId);
    }
    
    // Fetch user details
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const fullName = user.fullName;

    // Generate the next department ID
    const lastDepartment = await Department.findOne().sort({ departmentid: -1 });
    let nextDepartmentId = "D1";
    if (lastDepartment && lastDepartment.departmentid) {
      const lastIdNumber = parseInt(lastDepartment.departmentid.substring(1));
      nextDepartmentId = `D${lastIdNumber + 1}`;
    }

    // Create new department
    const newDepartment = new Department({
      departmentid: nextDepartmentId,
      departmentName,
      departmentDescription,
    });
    await newDepartment.save();

    // Log the "Add" event
    const logId = `${userId}-${Date.now()}`;
    await DepartmentLog.create({
      logId,
      userId,
      fullName,
      departmentId: newDepartment.departmentid,
      departmentName: newDepartment.departmentName,
      event: "Add",
    });

    res.status(201).json({ message: "Department added successfully", department: newDepartment });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { departmentid, departmentName, departmentDescription } = req.body;
    if (!departmentid || !departmentName || !departmentDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Update the department
    const department = await Department.findOneAndUpdate(
      { departmentid },
      { departmentName, departmentDescription },
      { new: true }
    );
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Use session userId as in loginController
    const userId = req.session.userId;
    console.log(userId);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Fetch the user to get the fullName
    const user = await User.findOne({ userId });
    const fullName = user ? user.fullName : "Unknown User";

    // Create a log entry for the "Edit" event
    const logId = `${userId}-${Date.now()}`;
    await DepartmentLog.create({
      logId,
      userId,
      fullName,
      departmentId: department.departmentid,
      departmentName: department.departmentName,
      event: "Edit",
    });

    res.status(200).json({ message: "Department updated successfully", department });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteDepartments = async (req, res) => {
  try {
    const { ids } = req.body; // Get selected department IDs from frontend
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No departments selected" });
    }
    // Fetch departments to be deleted for logging purposes
    const departmentsToDelete = await Department.find({ departmentid: { $in: ids } });
    // Delete the departments
    await Department.deleteMany({ departmentid: { $in: ids } });
    // Log the "Delete" event for each department
    const userId = req.session.userId;
    const user = await User.findOne({ userId });
    const fullName = user ? user.fullName : "Unknown User";
    for (let dept of departmentsToDelete) {
      const logId = `${userId}-${Date.now()}-${dept.departmentid}`;
      await DepartmentLog.create({
        logId,
        userId,
        fullName,
        departmentId: dept.departmentid,
        departmentName: dept.departmentName,
        event: "Delete",
      });
    }
    res.status(200).json({ message: "Departments deleted successfully" });
  } catch (error) {
    console.error("Error deleting departments:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// fetching the department log
export const getDepartmentLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortField = "timestamp", sortOrder = "desc", event } = req.query;

    const query = {}; // Filter object
    if (event) {
      query.event = event; // Apply event filter if provided
    }

    const totalLogs = await DepartmentLog.countDocuments(query); // Count total logs
    const logs = await DepartmentLog.find(query)
      .sort({ [sortField]: sortOrder === "desc" ? -1 : 1 }) // Sort dynamically
      .skip((page - 1) * limit) // Skip for pagination
      .limit(parseInt(limit)); // Limit per page

    res.status(200).json({
      logs,
      totalPages: Math.ceil(totalLogs / limit),
    });
  } catch (error) {
    console.error("Error fetching department logs:", error);
    res.status(500).json({ message: "Failed to fetch department logs" });
  }
};

