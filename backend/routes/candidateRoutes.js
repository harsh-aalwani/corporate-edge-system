import express from "express";
import { createCandidate } from "../controllers/candidateController.js";
import upload from "../middleware/multerConfig.js";

const router = express.Router();
router.post(
  "/add",
  upload.fields([
    { name: "candidateDocuments", maxCount: 1 },
    { name: "candidatePicture", maxCount: 1 }
  ]),
  createCandidate
);

export default router;
