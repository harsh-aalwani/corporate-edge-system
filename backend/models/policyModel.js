import mongoose from "mongoose";

const policySchema = new mongoose.Schema({
  policyId: { type: String, unique: true },
  policyTitle: { type: String, required: true },
  policyDescription: { type: String, required: true },
  policyTag: { type: [String], default: [] },
  policyScheduleTime: { type: Date, required: true },
}, { timestamps: true });

const Policy = mongoose.model("Policy", policySchema);
export default Policy;
