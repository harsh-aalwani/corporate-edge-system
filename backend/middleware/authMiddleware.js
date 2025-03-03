import User from "../models/userModel.js";

const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.header("userId"); // Assuming userId is sent in request headers

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No userId provided" });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = { userId: user.userId, userRoleid: user.userRoleid }; // ✅ Attach user details
    next();
  } catch (error) {
    console.error("❌ Authentication Error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

export default authenticateUser;
