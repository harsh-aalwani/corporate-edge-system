import express from 'express';
import { getHRManagers,getEmployee,getDeptManager,getSystemAdmin,getAllCounts,historyData } from '../controllers/manageControllers.js';  // Import controller function

const router = express.Router();

// Route to get HR Managers (userRoleid = 'R3')
router.get('/hr-managers', getHRManagers);  // Ensure the correct path for fetching HR Managers

router.get('/employees', getEmployee);  

router.get('/department-managers',getDeptManager);

router.get('/system-admins',getSystemAdmin);

router.get("/counts", getAllCounts); 

router.post("/history", historyData); 

export default router;
