import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure directories exist
const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    if (file.fieldname === "candidateDocuments") {
      uploadPath += "candidate/candidateDocuments/";
    } else if (file.fieldname === "candidatePicture") {
      uploadPath += "candidate/candidatePictures/";
    } else if (file.fieldname === "identityProof") {
      uploadPath += "userDocuments/";
    } else if (file.fieldname === "picture") {
      uploadPath += "userPictures/";
    }

    createDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export default upload;
