import express from "express";
import upload from "../middleware/multerConfig.js"; // ✅ Import Multer Config
import {
  createAppraisal,
  getUserDetails,
  
  getAllAppraisals, submitFinalAssessment, scheduleReview,
    approveAppraisal,
  rejectAppraisal,
} from "../controllers/appraisalController.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// 📌 Get User Details
router.get("/user/details", getUserDetails);

// 📌 Submit Appraisal (Upload Signature & Documents)
router.post(
  "/",
  upload.fields([{ name: "files", maxCount: 5 }, { name: "signature", maxCount: 1 }]),
  createAppraisal
);

router.get("/all", getAllAppraisals);

router.post("/add-review", scheduleReview);
router.post("/submit-assessment", submitFinalAssessment);

// 📌 Schedule Review
router.post("/add-review", scheduleReview);
// 📌 Generate & Download Appraisal Report
router.get("/report/:appraisalId", async (req, res) => {
  try {
    const { appraisalId } = req.params;
    const filePath = `uploads/reports/${appraisalId}_Appraisal_Report.pdf`;

    console.log("🔍 Checking for report:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error("❌ Report file does not exist:", filePath);
      return res.status(404).json({ message: "Report not found" });
    }

    res.download(filePath);
  } catch (error) {
    console.error("❌ Error in report download:", error);
    res.status(500).json({ message: "Error downloading report", error: error.message });
  }
});

// ✅ Approve Appraisal
router.put("/approve/:appraisalId", approveAppraisal); // ✅ Correct Path
router.put("/reject/:appraisalId", rejectAppraisal);   // ✅ Correct Path

export default router;
