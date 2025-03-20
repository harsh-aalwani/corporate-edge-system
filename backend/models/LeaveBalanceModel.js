import mongoose from "mongoose";


const LeaveUsageSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  type: { type: String, required: true }, // ✅ Store leaveId (e.g., "LA1") instead of ObjectId
  used: { type: Number, required: true, default: 0 }
});




LeaveUsageSchema.statics.getUsedLeaves = async function (employeeId) {
  const usedLeaves = await mongoose.model("Leave").aggregate([
    { $match: { employeeId, status: "Approved" } },
    { $group: { _id: "$type", used: { $sum: { $add: [
      { $ceil: { $divide: [{ $subtract: ["$endDate", "$startDate"] }, 1000 * 60 * 60 * 24] } },
      0 // ✅ Start date dobara count nahi hogi
    ] } } } },
  ]);
  return usedLeaves.map(({ _id, used }) => ({ type: _id, used }));
};


export const LeaveUsage = mongoose.model("LeaveUsage", LeaveUsageSchema, "leaveusages");
