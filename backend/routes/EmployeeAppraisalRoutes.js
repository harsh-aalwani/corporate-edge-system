import express from "express";
import multer from "multer";
import {
  createEmployeeAppraisal,
  getAllEmployeeAppraisals,
  updateAppraisalStatus,
} from "../controllers/appraisalController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Routes
router.post("/create", upload.single("relatedDocuments"), createEmployeeAppraisal);
router.get("/list", getAllEmployeeAppraisals);
router.put("/update/:id", updateAppraisalStatus);

export default router;
