import multer from "multer";
import path from "path";
import fs from "fs";

// 📂 Define Storage Paths
const storagePaths = {
  appraisalDocuments: "uploads/appraisalDocuments/",
  candidateDocuments: "uploads/candidate/candidateDocuments/",
  candidatePictures: "uploads/candidate/candidatePictures/",
  userDocuments: "uploads/userDocuments/",
  userPictures: "uploads/userPictures/",
  signatures: "uploads/signatures/", // ✅ Store Signature Images
  reports: "uploads/reports/", // ✅ Store Generated Reports
};

// ✅ Ensure all directories exist before storing files
Object.values(storagePaths).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 🛠 Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/"; // Default folder if no match

    switch (file.fieldname) {
      case "supportingDocuments":
      case "files":
        uploadPath = storagePaths.appraisalDocuments;
        break;
      case "candidateDocuments":
        uploadPath = storagePaths.candidateDocuments;
        break;
      case "candidatePicture":
        uploadPath = storagePaths.candidatePictures;
        break;
      case "identityProof":
        uploadPath = storagePaths.userDocuments;
        break;
      case "picture":
        uploadPath = storagePaths.userPictures;
        break;
      case "signature":
        uploadPath = storagePaths.signatures;
        break;
      case "report":
        uploadPath = storagePaths.reports;
        break;
      default:
        console.warn(`⚠️ Unknown field: ${file.fieldname}. Storing in default folder.`);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    let filename = file.originalname.replace(/\s+/g, "_"); // Default name cleanup

    // ✅ Use the provided file name from the frontend if available
    if (req.body.fileNames && req.body.fileNames[file.fieldname]) {
      filename = req.body.fileNames[file.fieldname] + path.extname(file.originalname);
    }

    cb(null, filename);
  },
});

// 📌 File Filter to Allow Specific File Types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and PDF files are allowed!"), false);
  }
};

// 📌 Multer Upload Configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});

export default upload;
