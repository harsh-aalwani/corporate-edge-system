// routes/userRoutes.js
import express from 'express';
import upload from "../middleware/multerConfig.js";
import { loginUser, logoutUser,getUserProfile, getUserAccess,getUserRoles,createUserWithDetails } from '../controllers/userController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', getUserProfile);
router.get('/access', getUserAccess);
router.get("/rolesList", getUserRoles);
router.post("/createUserWithDetails",
    upload.fields([
      { name: "identityProof", maxCount: 1 }, 
      { name: "picture", maxCount: 1 }
    ]), 
    createUserWithDetails);

export default router;
