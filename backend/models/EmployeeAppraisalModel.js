import mongoose from "mongoose";

const EmployeeAppraisalSchema = new mongoose.Schema(
  {
    appraisalId: { type: String, unique: true, required: true }, // ✅ Unique ID
   
    appraisalTitle: { type: String, required: true },
    appraisalDescription: { type: String, required: true },
    departmentId: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved by Manager", "Rejected by Manager", "Approved by HR", "Rejected by HR"],
      default: "Pending",
    },
    comments: { type: String },
    evaluatedBy: { type: String },
    relatedDocuments: { type: String }, // Store file path
  },
  { timestamps: true }
);

const EmployeeAppraisal = mongoose.model("EmployeeAppraisal", EmployeeAppraisalSchema);
export default EmployeeAppraisal;
