// backend/routes/DiscordAnnounceRoutes.js
import express from "express";
import { getDepartments,createDepartment,deleteDepartments } from "../controllers/departmentController.js";

const router = express.Router();

// POST route for sending an announcement
router.get("/list", getDepartments);
router.post("/addDepartment", createDepartment);
router.delete("/deleteDepartment", deleteDepartments);

export default router;
