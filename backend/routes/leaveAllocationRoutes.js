import express from "express";
import { addLeaveAllocation, getLeaveAllocations, getLeaveById, updateLeaveAllocation, deleteLeaveAllocations } from "../controllers/leaveAllocationController.js";

const router = express.Router();

router.get("/list", getLeaveAllocations);
router.get("/getLeave/:leaveId", getLeaveById); // ✅ Fix: Use GET and Params

router.post("/add", addLeaveAllocation);
router.put("/update", updateLeaveAllocation);
router.delete("/delete", deleteLeaveAllocations);

export default router;
