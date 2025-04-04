import express from "express";
import { sendEmails } from "../controllers/emailController.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { contactUs } from "../controllers/emailController.js";

const router = express.Router();

// 📂 Define the upload directory
const uploadDir = "uploads/Candidate/emails";

// ✅ Ensure the directory exists before uploading files
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🛠 Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the pre-validated directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`); // Prevents space issues
  }
});

// 📌 Multer upload middleware (limits file size and count)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and PDF files are allowed!"));
    }
  }
});

// 📧 Email sending route (accepts email data & up to 5 attachments)
router.post("/send", upload.array("documents", 5), async (req, res, next) => {
  try {
    await sendEmails(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/contactUs", contactUs);

export default router;
