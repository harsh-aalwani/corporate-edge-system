// routes/userRoutes.js
import express from 'express';
import { loginUser, logoutUser, updateUserStatus,getUserProfile } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/status', auth, updateUserStatus);
router.get('/profile', auth, getUserProfile);

export default router;
