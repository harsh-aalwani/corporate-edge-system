import express from "express";
import { addPerformanceRecord, fetchPreviousPerformanceRecords , deletePerformanceRecord, deleteAllPerformanceRecords} from "../controllers/candidatePerformanceController.js";

const router = express.Router();

// ✅ Ensure this is registered correctly
router.post("/addRecord", addPerformanceRecord);
router.post("/getPerformanceData", fetchPreviousPerformanceRecords);
router.post("/deleteRecord", deletePerformanceRecord);       // ✅ Delete single record
router.post("/deleteAllRecords", deleteAllPerformanceRecords); // ✅ Delete all records for a candidate

export default router;
