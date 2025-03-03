import EmployeeConcern from "../models/employeeConcernModel.js";
import Department from "../models/departmentsModel.js";





// Function to generate a unique complaint ID
const generateComplaintId = async () => {
  const lastComplaint = await EmployeeConcern.findOne().sort({ complaintId: -1 });
  const lastId = lastComplaint ? parseInt(lastComplaint.complaintId.replace("CO", "")) : 0;
  return `CO${lastId + 1}`;
};

export const createEmployeeConcern = async (req, res) => {
  try {

    // Generate complaint ID
    const complaintId = await generateComplaintId();

    // Extract all fields from request
    const {
      complaintTitle,
      complaintDescription,
      departmentid,
      departmentManagerName,
      status,
      comments,
      
      approvedByManager,
      approvedByHR,
    } = req.body;

    // Ensure all required fields are provided
    if (!departmentid || !complaintTitle || !complaintDescription) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    const newConcern = new EmployeeConcern({
      complaintId,
      complaintTitle,
      complaintDescription,
      departmentid,
      departmentManagerName: departmentManagerName || "Unknown",
      status: status || "Pending",
      comments,
    
      approvedByManager: approvedByManager || false,
      approvedByHR: approvedByHR || false,
      relatedDocuments: req.file ? req.file.filename : null,
    });

    await newConcern.save();
    res.status(201).json({ message: "Concern created successfully!", concern: newConcern });
  } catch (error) {
    console.error("❌ Error in createEmployeeConcern:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getAllEmployeeConcerns = async (req, res) => {
  try {
    const concerns = await EmployeeConcern.find();
    res.status(200).json(concerns);
  } catch (error) {
    console.error("Error in getAllEmployeeConcerns:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}, { departmentid: 1, departmentName: 1, _id: 0 });
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error in getDepartments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateConcernStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const concern = await EmployeeConcern.findById(id);
    if (!concern) {
      return res.status(404).json({ error: "Concern not found" });
    }

    // ✅ Ensure valid status updates
    if (!["Pending", "Approved by Manager", "Rejected by Manager", "Approved by HR", "Rejected by HR"].includes(status)) {
      return res.status(400).json({ error: "Invalid status update" });
    }

    concern.status = status;
    await concern.save();

    res.status(200).json({ message: "Concern status updated successfully!", concern });
  } catch (error) {
    console.error("❌ Error in updateConcernStatus:", error);
    res.status(500).json({ error: "Failed to update concern status" });
  }
};
