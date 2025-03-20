import mongoose from "mongoose";

const concernSchema = new mongoose.Schema(
  {
    concernId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userDepartment: { type: String, required: true }, // ✅ Department added
    userDesignation: { type: String, required: true }, // ✅ Designation added
    subject: { type: String, required: true },
    message: { type: String, required: true },
    supportingDocuments: { type: [String], default: [] },
    managerStatement: { type: String, default: "" }, // ✅ Manager Statement
    status: { type: String, default: "Pending", enum: ["Pending", "approved", "Rejected"] }, // ✅ Status added
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Concern", concernSchema);
