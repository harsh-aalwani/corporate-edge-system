// models/userLogModel.js
import mongoose from "mongoose";

const userLogSchema = new mongoose.Schema({
  logId: { type: String, unique: true, required: true },
  userId: { type: String, required: true, ref: "User" },
  event: { type: String, required: true, enum: ["Login", "Logout","AddUser","EditUser"] },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("UserLog", userLogSchema, "tableUserLogs");
