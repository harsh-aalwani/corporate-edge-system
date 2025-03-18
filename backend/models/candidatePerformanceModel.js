import mongoose from "mongoose";

const performanceCriteriaSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "Technical Skills"
  score: { type: Number, required: true, min: 0, max: 100 }, // Score out of 100
});

const performanceRecordSchema = new mongoose.Schema({
  candidatePerformanceId: { type: String, unique: true, required: true },
  candidateId: { type: String, required: true },  // ✅ Added candidateId
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  recordName: { type: String, required: true },
  criteria: [performanceCriteriaSchema], 
  remarks: { type: String, default: "" },
  candidateAssessment: { type: String, required: true }, // Store assessment
  averageScore: { type: Number, default: 0 }, // Store calculated percentage
});

const CandidatePerformance = mongoose.model(
  "CandidatePerformance", 
  performanceRecordSchema, 
  "tableCandidatePerformance" // ✅ Collection name specified
);

export default CandidatePerformance;
