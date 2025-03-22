import express from "express";
import { 
  createPolicy, 
  getAllPolicies, 
  getPolicyById, 
  updatePolicy, 
  deletePolicy,
  getPolicyCount,
} from "../controllers/policyController.js";

const router = express.Router();

router.post("/create", createPolicy);
router.get("/list", getAllPolicies);
router.get("/:id", getPolicyById); // ✅ Ensure this matches the frontend request
router.put("/update/:id", updatePolicy); // ✅ Ensure the update API uses `/:id`
router.delete("/delete", deletePolicy);
router.get("/count", getPolicyCount); // ✅ API for policy count

export default router;
