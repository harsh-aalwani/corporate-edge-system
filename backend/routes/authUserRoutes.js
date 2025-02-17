// routes/userRoutes.js
import express from 'express';
import {sendOtp, resetPassword} from '../controllers/authUserController.js';

const router = express.Router();

router.post('/sendotp', sendOtp);
router.post('/resetpassword', resetPassword);

export default router;
