import express from "express";
import { addConcern,getAllConcerns,addManagerStatement,approveConcern, rejectConcern} from "../controllers/employeeConcernController.js";
import upload from "../middleware/multerConfig.js"; // ✅ Ensure correct path

const router = express.Router();

// Route to create an employee concern
router.post("/add", upload.array("supportingDocuments", 3), addConcern);
router.get("/concerns", getAllConcerns); // ✅ Fetch all concerns
router.put("/concerns/statement", addManagerStatement); // ✅ Add manager statement
router.put("/concerns/approve", approveConcern); // ✅ Approve a concern
router.put("/concerns/reject", rejectConcern); // ✅ Reject a concern
export default router;
