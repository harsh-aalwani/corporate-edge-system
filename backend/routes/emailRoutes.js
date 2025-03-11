import express from "express";
import { sendEmails } from "../controllers/emailController.js";
import multer from "multer";

const router = express.Router();

// Multer setup for file uploads (stores files in "uploads" folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/Candidate/emails"); // Save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  }
});

const upload = multer({ storage });

// Email sending route (accepts email data & file attachments)
router.post("/send", upload.array("documents", 5), sendEmails);

export default router;
