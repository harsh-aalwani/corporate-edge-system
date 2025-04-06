import express from 'express';
import { getHRManagers,getEmployee,getDeptManager,getSystemAdmin,getAllCounts,historyData,verifyCaptcha,getUserLeaveBalances, toggleSystemAdminStatus,toggleHRManagerStatus,toggleDepartmentManagerStatus,toggleEmployeeStatus} from '../controllers/manageControllers.js';  // Import controller function

const router = express.Router();

router.get('/hr-managers', getHRManagers);  // Ensure the correct path for fetching HR Managers

router.get('/employees', getEmployee);  

router.get('/department-managers',getDeptManager);

router.get('/system-admins',getSystemAdmin);

router.get("/counts", getAllCounts); 

router.post("/history", historyData); 

router.get("/leave-balances", getUserLeaveBalances);

router.put('/system-admins/status/:userId', toggleSystemAdminStatus);

router.put('/hr-managers/status/:userId', toggleHRManagerStatus);

router.put('/department-managers/status/:userId', toggleDepartmentManagerStatus);

router.put('/employees/status/:userId', toggleEmployeeStatus);

router.post('/verify-captcha', verifyCaptcha);

export default router;
