// models/Log/announcementLogModel.js
import mongoose from "mongoose";

const announcementLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    default: () => `LOG-${Date.now()}`,
    unique: true
  },
  announcementId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete']
  },
  isJobVacancy: {
    type: Boolean,
    required: true
  },
  performedBy: {
    userId: {
      type: String,
      required: true,
      ref: "User"  // Points to userId in the User collection
    },
    fullName: {
      type: String,
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("AnnouncementLog", announcementLogSchema, "announcementLogs");
