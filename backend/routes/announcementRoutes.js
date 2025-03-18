import express from "express";
import { 
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncements,
  getEligibleUsers,
  getPublicAnnouncements,
  getPrivateAnnouncements,
  getJobData,
  getJobListings,
  getAnnouncementInfoById,
  concludeJob,
  reopenJob,  
  updateAssignedEvaluators,
  assignedJobs,
} from "../controllers/announcementController.js";

const router = express.Router();

// ✅ Create Announcement (POST)
router.post("/create", createAnnouncement);

// ✅ Get All Announcements (GET)
router.get("/list", getAnnouncements);

// ✅ Get Single Announcement by ID (POST)
router.post("/get", getAnnouncementById);

// ✅ Update Announcement (PUT)
router.put("/update", updateAnnouncement);

// ✅ Delete Announcements (DELETE)
router.delete("/delete", deleteAnnouncements);


// ✅ Get Eligible Users
router.get("/eligible-users", getEligibleUsers);

// ✅ Route to get only public announcements
router.get("/public-list", getPublicAnnouncements);
// private announcments
router.get("/private", getPrivateAnnouncements);

router.get("/jobdata", getJobData);

router.get("/jobListing",getJobListings);

router.post("/getAnnouncementInfoById", getAnnouncementInfoById);

router.put("/conclude/:announcementId", concludeJob);

router.put("/reopen/:announcementId", reopenJob);

router.post("/updateAssignedEvaluators", updateAssignedEvaluators); 

router.get("/assignedJobs",assignedJobs);

export default router;
