// routes/userRoutes.js
import express from 'express';
import { loginUser, logoutUser,getUserProfile} from '../controllers/userController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', getUserProfile);
export default router;
