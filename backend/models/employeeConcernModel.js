import mongoose from "mongoose";

const EmployeeConcernSchema = new mongoose.Schema(
  {
    complaintId: { type: String, unique: true },
    complaintTitle: { type: String, required: true },
    complaintDescription: { type: String, required: true },
    departmentid: { type: String, required: true },
    departmentManagerName: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Approved by Manager", "Rejected by Manager", "Approved by HR", "Rejected by HR"], // ✅ FIXED ENUM VALUES
      default: "Pending",
    },
    comments: { type: String },
    actionTakenby: { type: String },
    relatedDocuments: { type: String }, // Store file path
  },
  { timestamps: true }
);

const EmployeeConcern = mongoose.model("EmployeeConcern", EmployeeConcernSchema);
export default EmployeeConcern;
