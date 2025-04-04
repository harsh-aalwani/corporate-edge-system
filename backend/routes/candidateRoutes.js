import express from "express";
import { createCandidate,getCandidateList, selectCandidatesUpdate ,getCandidateById, confirmJobOffer, searchCandidate, getCandidateByIdAndDepartment, toggleApproval} from "../controllers/candidateController.js";
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

router.post("/List",getCandidateList);
router.put("/select",selectCandidatesUpdate);
router.post("/getCandidate", getCandidateById);
router.post("/getCandidatewithDept",getCandidateByIdAndDepartment);
router.post("/toggleApproval",toggleApproval);
router.post("/searchCandidatesJob", searchCandidate);
router.post('/confirmJobOffer', confirmJobOffer);

export default router;
