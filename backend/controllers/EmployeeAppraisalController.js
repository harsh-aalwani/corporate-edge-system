import EmployeeAppraisal from "../models/EmployeeAppraisalModel.js";
import Department from "../models/departmentsModel.js";

// ✅ Function to Generate Unique Appraisal ID
const generateAppraisalId = async () => {
    const count = await EmployeeAppraisal.countDocuments();
    return `AP${count + 1}`;
};

export const createEmployeeAppraisal = async (req, res) => {
    try {
        
        const {
            appraisalTitle,
            appraisalDescription,
            departmentId,
            status,
            comments,
         
        } = req.body;

        // ✅ Generate unique Appraisal ID
        const appraisalId = await generateAppraisalId();

        const newAppraisal = new EmployeeAppraisal({
            appraisalId,
            appraisalTitle,
            appraisalDescription,
            departmentId,
            status: status || "Pending", // ✅ Default to Pending
            comments,
           
            relatedDocuments: req.file ? req.file.filename : null,
        });

        await newAppraisal.save();
        res.status(201).json({ message: "Appraisal created successfully!", appraisal: newAppraisal });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAllEmployeeAppraisals = async (req, res) => {
    try {
        // ✅ Fetch all fields from EmployeeAppraisal table
        const appraisals = await EmployeeAppraisal.find({}).lean();

        if (!appraisals.length) {
            return res.status(404).json({ error: "No appraisals found" });
        }

        res.status(200).json(appraisals);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({}, { _id: 1, departmentName: 1 });
        res.status(200).json(departments);
    } catch (error) {
        console.error("❌ Error in getDepartments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateAppraisalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;


        const appraisal = await EmployeeAppraisal.findById(id);
        if (!appraisal) {
            return res.status(404).json({ error: "Appraisal not found" });
        }

        if (!["Pending", "Approved by Manager", "Rejected by Manager", "Approved by HR", "Rejected by HR"].includes(status)) {
            return res.status(400).json({ error: "Invalid status update" });
        }

        appraisal.status = status;
        await appraisal.save();

        res.status(200).json({ message: "Appraisal status updated successfully!", appraisal });
    } catch (error) {
        res.status(500).json({ error: "Failed to update appraisal status" });
    }
};