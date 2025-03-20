import express from "express";
import { applyLeave ,getLeaveRequests, approveLeave, rejectLeave,getLeaves,getLeaveById,getLeaveRequestsForManagers ,getLeaveUsage,getUserWithdrawRequests, requestWithdrawLeave
  ,getAllUserLeaves} from "../controllers/leaveController.js";
import { LeaveAllocation } from "../models/leaveAllocationModel.js"; 
const router = express.Router();


router.post("/apply-leave", applyLeave);

router.get("/requests", getLeaveRequests);
router.get("/getLeaveRequestsForManagers", getLeaveRequestsForManagers);
router.put("/approve/:leaveId", approveLeave);
router.put("/reject/:leaveId", rejectLeave);
router.get("/usage", getLeaveUsage);
router.get("/", getLeaves);           // GET all leaves or search by department
router.get("/leave-types", async (req, res) => {
  try {
    const leaveTypes = await LeaveAllocation.find({}, "leaveName");
    res.status(200).json(leaveTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave types" });
  }
});
router.put("/request-withdraw/:leaveId", requestWithdrawLeave);

// Move this below
router.get("/user-withdraw-requests", getUserWithdrawRequests); 
router.get("/user-all-leaves", getAllUserLeaves);

router.get("/:id", getLeaveById);

export default router;
