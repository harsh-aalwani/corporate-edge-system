// routes/userRoutes.js
import express from 'express';
import { loginUser, logoutUser, updateUserStatus,getUserProfile, getUserRole} from '../controllers/userController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/status', updateUserStatus);
router.get('/profile', getUserProfile);
router.get('/getUserRole', getUserRole);
export default router;
