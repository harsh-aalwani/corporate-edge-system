import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  leaveId: { type: String, unique: true, required: true, index: true }, // ✅ Indexed for faster lookup
  employeeId: { type: String, required: true, index: true },
  employeeName: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  employeeDepartment: { type: String, required: true },
  employeeDesignation: { type: String, required: true },
  type: { type: String, required: true },
  leaveName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },

  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Rejected", "Withdrawn", "Completed"], 
    default: "Pending" 
  }, // ✅ Status will only be valid values

  halfDay: { type: Boolean, default: false },
  halfDayTime: { type: String },
  fullDay: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  remarks: { type: String, default: "" },
});

// ✅ Static Method to Auto-Update "Completed" Status
leaveSchema.statics.updateCompletedLeaves = async function () {
  try {
    const today = new Date();
    const result = await this.updateMany(
      { endDate: { $lt: today }, status: "Approved" },
      { $set: { status: "Completed" } }
    );
    console.log(`✅ ${result.modifiedCount} leaves marked as Completed.`);
  } catch (error) {
    console.error("❌ Error updating completed leaves:", error.message);
  }
};

export default mongoose.model("Leave", leaveSchema, "tableLeave");
