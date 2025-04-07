// models/departmentLogModel.js
import mongoose from "mongoose";

const departmentLogSchema = new mongoose.Schema({
  logId: { type: String, unique: true, required: true },
  userId: { type: String, required: true, ref: "User" },
  fullName: { type: String, required: true },
  departmentId: { type: String, required: true },
  departmentName: { type: String, required: true },
  event: { type: String, required: true, enum: ["Add", "Edit", "Delete"] },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("DepartmentLog", departmentLogSchema, "departmentLogs");
