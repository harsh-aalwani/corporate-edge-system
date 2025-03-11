import mongoose from "mongoose";

const performanceCriteriaSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "Technical Skills"
  score: { type: Number, required: true, min: 0, max: 100 }, // Score out of 100
});

const performanceRecordSchema = new mongoose.Schema({
  candidatePerformanceId: { type: String, unique: true, required: true }, // Unique Performance ID
  createdBy: { type: String, required: true }, // User who created the record
  createdAt: { type: Date, default: Date.now }, // Auto-generated timestamp
  recordName: { type: String, required: true }, // Custom record name
  criteria: [performanceCriteriaSchema], // ✅ Changed to lowercase for consistency
  remarks: { type: String }, // Optional remarks
  candidateAssessment: { 
    type: String, 
    enum: ["Good", "Above Average", "Average", "Below Average", "Bad"], 
    required: true 
  }, // ✅ Renamed from `MarkCandidate` to `CandidateAssessment`
  candidateId: { type: String, required: true, index: true }, // ✅ Indexed for fast queries
});

const CandidatePerformance = mongoose.model(
  "CandidatePerformance", 
  performanceRecordSchema, 
  "tableCandidatePerformance" // ✅ Collection name specified
);

export default CandidatePerformance;
