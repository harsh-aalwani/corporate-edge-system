import express from 'express';
import { loginUser } from '../controllers/userController.js';

const router = express.Router();

// Route for user login (no session required)
router.post('/login', loginUser);

export default router;
