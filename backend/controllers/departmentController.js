import Department from "../models/departmentsModel.js";

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a single department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { departmentName, departmentDescription } = req.body;

    if (!departmentName || !departmentDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the latest department and generate the next ID
    const lastDepartment = await Department.findOne().sort({ departmentid: -1 });

    let nextDepartmentId = "D1"; // Default if no records exist
    if (lastDepartment && lastDepartment.departmentid) {
      const lastIdNumber = parseInt(lastDepartment.departmentid.substring(1)); // Extract number from "D1"
      nextDepartmentId = `D${lastIdNumber + 1}`;
    }

    // Create new department with generated ID
    const newDepartment = new Department({
      departmentid: nextDepartmentId,
      departmentName,
      departmentDescription,
    });

    await newDepartment.save();

    res.status(201).json({ message: "Department added successfully", department: newDepartment });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a department by ID
export const updateDepartment = async (req, res) => {
  try {
    const { departmentName, departmentDescription } = req.body;
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      { departmentName, departmentDescription },
      { new: true, runValidators: true }
    );
    if (!updatedDepartment) return res.status(404).json({ message: "Department not found" });
    res.status(200).json({ message: "Department updated", department: updatedDepartment });
  } catch (error) {
    res.status(400).json({ message: "Error updating department", error });
  }
};

export const deleteDepartments = async (req, res) => {
  try {
    const { ids } = req.body; // Get selected department IDs from frontend

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No departments selected" });
    }

    await Department.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: "Departments deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
