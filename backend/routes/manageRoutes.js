import express from 'express';
import { getHRManagers } from '../controllers/manageControllers.js';  // Import controller function

const router = express.Router();

// Route to get HR Managers (userRoleid = 'R3')
router.get('/hr-managers', getHRManagers);  // Ensure the correct path for fetching HR Managers

export default router;
