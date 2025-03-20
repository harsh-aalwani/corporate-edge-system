import mongoose from "mongoose"; // ✅ Import mongoose

const LeaveAllocationSchema = new mongoose.Schema({
  leaveId: { type: String, required: true, unique: true }, // ✅ Ensure this is unique
  leaveName: { type: String, required: true },
  leaveNumber: { type: Number, required: true },
  leaveDescription: { type: String, required: true },
  leaveValidFrom: { type: Date },
  leaveValidTo: { type: Date },
  leaveYearlyRefresh: { type: Boolean, default: false },
  isPaidLeave: { type: Boolean, default: false }
});

// ✅ Ensure the model only relies on leaveId
export const LeaveAllocation = mongoose.model("LeaveAllocation", LeaveAllocationSchema, "leaveallocations");


