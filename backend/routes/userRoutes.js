// routes/userRoutes.js
import express from "express";
import upload from "../middleware/multerConfig.js";
import {
  loginUser,
  logoutUser,
  getUserProfile,
  getUserAccess,
  getUserRoles,
  createUserWithDetails,
  getUserInfoAndExperience,
  createUsersFromCandidates,
  evaluatorsLogin,
  changePassword,
  verifyPassword,
  updateProfilePicture,
  getAllUsers,
  getUserById,
  getAllUserDetails,
  getUserDetailsById,
  updateUserWithDetails,
  getUserLogs,
  getAllUsersSafe,
  getLoggedInUserDepartment,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", getUserProfile);
router.get("/access", getUserAccess);
router.get("/rolesList", getUserRoles);
router.post("/change-password", changePassword);
router.post("/verify-password", verifyPassword);
router.put(
  "/update-profile-picture/:id",
  upload.single("picture"),
  updateProfilePicture
);

router.post(
  "/createUserWithDetails",
  upload.fields([
    { name: "identityProof", maxCount: 1 },
    { name: "picture", maxCount: 1 },
  ]),
  createUserWithDetails
);

router.post("/getUserInfoAndExperience", getUserInfoAndExperience);
router.post("/evaluatorsLogin", evaluatorsLogin);
router.post("/createUsersFromCandidates", createUsersFromCandidates);

//Edit user
router.get("/getAllUsers", getAllUsers); // ✅ Get all users
router.get("/getAllUsersSafe", getAllUsersSafe); // ✅ Get all safe users
router.get("/getUserById/:id", getUserById); // ✅ Get a single user by ID
router.get("/getAllUserDetails", getAllUserDetails); // ✅ Get all user details
router.get("/getUserDetailsById/:id", getUserDetailsById); // ✅ Get a single user's details
router.put("/update", updateUserWithDetails);
router.get("/getLoggedInUserDepartment", getLoggedInUserDepartment);

// user log
router.get("/getUserLogs", getUserLogs);

export default router;
