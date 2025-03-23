// models/EmployeeAppraisal.js
import mongoose from "mongoose";

const EmployeeAppraisalSchema = new mongoose.Schema({
  appraisalId: {
    type: String,
    required: true,
    unique: true
  },
  appraisalDate: { 
    type: Date, 
    required: true 
  },
  achievements: { 
    type: [String], 
    required: true 
  },
  files: { 
    type: [String] 
  }, // Array of file paths
  goalsAchieved: { 
    type: String, 
    required: true 
  },
  nextGoals: { 
    type: String, 
    required: true 
  },
  trainingNeeds: { 
    type: [String], 
    required: true 
  },
  challengesFaced: { 
    type: String, 
    required: true 
  },
  feedbackSuggestions: { 
    type: String, 
    required: true 
  },
  employeeAcknowledgment: { 
    type: Boolean, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  employeeId: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String, 
    required: true 
  },
  designation: { 
    type: String, 
    required: true 
  },
  dateOfJoining: { 
    type: Date, 
    required: true 
  },
  signature: { 
    type: String 
  },  // Base64 string for signature
  supportingDocuments: { 
    type: [String] 
  }, // Array of file paths

  finalAssessment: { 
    type: String 
  },
  performanceRatings: { 
    JobKnowledge: { type: String },
    WorkQuality: { type: String },
    Productivity: { type: String },
    Teamwork: { type: String },
    Communication: { type: String },
    Punctuality: { type: String }
  },

  // New `status` Field Added
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },

  // Store Rejection Reason
  rejectionReason: { 
    type: String 
  },

  reviewDate: { 
    type: String 
  },
  reviewTime: { 
    type: String 
  },
  reviewLink: { 
    type: String 
  },
  reportUrl: { 
    type: String 
  }, // Store Report Path in DB
  createdBy: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model("EmployeeAppraisal", EmployeeAppraisalSchema);
