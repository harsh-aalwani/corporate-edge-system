import express from "express";
import { createSchedule, getUserSchedules,deleteSchedule } from "../controllers/scheduleController.js";

const router = express.Router();

// ✅ Route to create a new schedule
router.post("/create", createSchedule);

// ✅ Route to get logged-in user's schedules
router.get("/my-schedules", getUserSchedules);

router.post("/delete", deleteSchedule);

export default router;
