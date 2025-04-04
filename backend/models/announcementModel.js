import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  announcementId: { type: String, unique: true },
  announcementTitle: { type: String, required: true },
  announcementDescription: { type: String, required: true },
  announcementTag: { type: String, required: true },
  announcementPublic: { type: Boolean, default: false },
  announcementSend: {
    sendDiscord: { type: Boolean, default: false },
    sendEmail: { type: Boolean, default: false },
  },
  announcementScheduleTime: { type: Date, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  jobPosition: { type: String, default: null },
  jobType: { type: String, default: null },
  jobDescription: { type: String, default: null },
  salaryRange: {
    currency: { type: String, default: null },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
  },
  requiredExperience: { type: String, default: null },
  skillsRequired: { type: [String], default: [] },
  educationQualification: { type: String, default: null },
  totalVacancy: { type: Number, default: null },
  applicationDeadline: { type: Date, default: null },

  // Department ID (stored as a string, not a reference)
  departmentId: { type: String, default: null },

  // ✅ New Field: Assigned Evaluators (Array of User IDs)
  assignedEvaluators: { type: [String], default: [] }, // Store user IDs

  // ✅ New: Indicates if a user has been added based on this announcement
  concluded: { type: Boolean, default: false },
});

// Pre-save hook: Auto-generate announcementId (e.g., AN1, AN2, AN3)
announcementSchema.pre("save", async function (next) {
  if (!this.announcementId) {
    try {
      const lastAnnouncement = await this.constructor.findOne().sort({ _id: -1 });
      const lastNumber = lastAnnouncement?.announcementId
        ? parseInt(lastAnnouncement.announcementId.replace("AN", ""), 10) || 0
        : 0;
      this.announcementId = `AN${lastNumber + 1}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});


const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
