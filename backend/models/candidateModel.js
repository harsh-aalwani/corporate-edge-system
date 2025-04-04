import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  candidateId: { type: String, unique: true }, // New field
  firstName: String,
  fatherName: String,
  surName: String,
  email: { type: String, required: true },
  phone: String,
  dob: String,
  age: Number,
  nativePlace: String,
  nationality: String,
  gender: String,
  maritalStatus: String,
  languagesKnown: String,
  candidateDocuments: { type: String, required: true },
  candidatePicture: { type: String },
  presentAddress: String,
  permanentAddress: String,
  educationQualification: Array,
  announcementId: { type: String, default: null },
  position: String,
  departmentId: { type: String, default: null },
  skills: String,
  specialization: String,
  salary: String,
  lastWorkPlace: String,
  yearsOfExperience: String,
  addressOfWorkPlace: String,
  responsibilities: String,
  referenceContact: String,
  totalYearsOfExperience: String,
  confirmInformation: Boolean,

  // ✅ Performance Evaluation (Percentage-Based)
  candidateEvaluation: {
    type: Number,
    default: 0, // Default score is 0%
    min: 0, // Cannot be below 0%
    max: 100, // Cannot exceed 100%
  },

  // ✅ Store detailed evaluation breakdown
  detailedEvaluation: {
    type: Object,
    default: {}, // Store per-field evaluation scores (skills, specialization, etc.)
  },

  // ✅ New: Candidate Performance Data
  candidatePerformance: {
    type: Number,
    default: 0,
  },

  selected: { type: Boolean, default: false },
  result: { type: Boolean, default: false },

  // ✅ New: Recruited Field
  recruited: { type: Boolean, default: false },

  // ✅ New: Job Confirmation Fields
  confirmationDeadline: { type: String, default: null }, // Default is null
  confirmationStatus: { type: String, default: "No" }, // Default is "No"

  // ✅ New: Store Past Emails Sent
  pastEmails: { type: Array, default: [] }, // Stores email logs
});

const Candidate = mongoose.model("tableCandidate", candidateSchema);
export default Candidate;
