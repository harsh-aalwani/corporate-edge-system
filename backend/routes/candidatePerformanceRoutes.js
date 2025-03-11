import express from "express";
import { addPerformanceRecord, fetchPreviousPerformanceRecords } from "../controllers/candidatePerformanceController.js";

const router = express.Router();

// ✅ Ensure this is registered correctly
router.post("/addRecord", addPerformanceRecord);
router.post("/getPerformanceData", fetchPreviousPerformanceRecords);

export default router;
