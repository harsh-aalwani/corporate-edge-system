import express from "express";
import multer from "multer";
import {
  createEmployeeConcern,
  getAllEmployeeConcerns,
  getDepartments,
  updateConcernStatus,  // ✅ ADD THIS
} from "../controllers/employeeConcernController.js";

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
router.post("/create", upload.single("relatedDocuments"), createEmployeeConcern);
router.get("/list", getAllEmployeeConcerns);
router.get("/departments", getDepartments);
router.put("/update/:id", updateConcernStatus); // ✅ Ensure Route is Correct

export default router;
