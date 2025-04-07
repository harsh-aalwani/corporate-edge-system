// backend/routes/DiscordAnnounceRoutes.js
import express from "express";
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartments, getDepartmentLogs} from "../controllers/departmentController.js";

const router = express.Router();

router.get("/list", getDepartments);
router.post("/getDepartment", getDepartmentById); // Changed from GET to POST
router.post("/addDepartment", createDepartment);
router.put("/updateDepartment", updateDepartment); 
router.delete("/deleteDepartment", deleteDepartments);

router.get("/getDepartmentLogs", getDepartmentLogs);

export default router;
