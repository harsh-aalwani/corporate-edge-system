import Concern from "../models/concernModel.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";



export const addConcern = async (req, res) => {
  try {
    console.log("Session User ID:", req.session.userId); // Debugging

    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "User is not logged in. Please log in again." });
    }

    // ✅ Fetch `userEmail`, `userDepartment`, and `userDesignation`
    const user = await User.findOne({ userId })
      .select("userEmail fullName userDepartment userDesignation")
      .lean();

    console.log("Fetched User:", user); // Debugging

    if (!user) {
      return res.status(404).json({ message: "User not found in the database." });
    }

    if (!user.userEmail) {
      console.error("Error: User email is missing in the database.");
      return res.status(400).json({ message: "User email not found in database." });
    }

    const { subject, message } = req.body;
    const filePaths = req.files ? req.files.map((file) => file.path) : [];

    const lastConcern = await Concern.findOne().sort({ concernId: -1 });
    let newNumber = lastConcern && lastConcern.concernId ? parseInt(lastConcern.concernId.replace("CN", ""), 10) + 1 : 1;
    const concernId = `CN${newNumber}`;

    // ✅ Save Concern to Database with Department & Designation
    const newConcern = new Concern({
      concernId,
      userId,
      userName: user.fullName,
      userDepartment: user.userDepartment, // ✅ Added Department
      userDesignation: user.userDesignation, // ✅ Added Designation
      subject,
      message,
      supportingDocuments: filePaths,
    });

    await newConcern.save();

    const emailSubject = "Concern Submitted Successfully";
    const emailBody = `
      Hello ${user.fullName},

      - Your concern has been submitted successfully.
      - We will review your concern and get back to you shortly.
    

      Thank you!
    `;

    // ✅ Use `user.userEmail` to send confirmation email
    await sendEmail(user.userEmail, emailSubject, emailBody);

    res.status(201).json({ 
      message: "Concern submitted successfully and email sent.", 
      concern: newConcern  // ✅ Returning updated concern details
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
//depatment manager


// ✅ Fetch all concerns
export const getAllConcerns = async (req, res) => {
  try {
    const concerns = await Concern.find().sort({ createdAt: -1 }); // Fetch latest concerns first
    res.status(200).json(concerns);
  } catch (error) {
    console.error("Error fetching concerns:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Add a statement to a concern
export const addManagerStatement = async (req, res) => {
  try {
    const { concernId, managerStatement } = req.body;

    // Find the concern by concernId
    const concern = await Concern.findOne({ concernId });

    if (!concern) {
      return res.status(404).json({ message: "Concern not found" });
    }

    // Update concern with manager's statement
    concern.managerStatement = managerStatement;
    await concern.save();

    res.status(200).json({ message: "Manager statement added successfully", concern });
  } catch (error) {
    console.error("Error updating concern:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
//hr approvel
// ✅ Approve Concern
// ✅ Approve Concern
export const approveConcern = async (req, res) => {
  try {
    const { concernId } = req.body;

    const concern = await Concern.findOne({ concernId });
    if (!concern) return res.status(404).json({ message: "Concern not found" });

    // ✅ Fetch user email based on `userId`
    const user = await User.findOne({ userId: concern.userId }).select("userEmail fullName");
    if (!user || !user.userEmail) {
      return res.status(400).json({ message: "User email not found in database" });
    }

    concern.status = "approved";
    await concern.save();

    // ✅ Send approval email
    const emailSubject = "Your Concern Has Been Approved";
    const emailBody = `
      Hello ${user.fullName},
      \nYour concern with subject ${concern.subject}has been approved.
     
      Thank you!
    `;
    await sendEmail(user.userEmail, emailSubject, emailBody);

    res.status(200).json({ message: "Concern approved & email sent.", concern });
  } catch (error) {
    console.error("Error approving concern:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Reject Concern
export const rejectConcern = async (req, res) => {
  try {
    const { concernId } = req.body;

    const concern = await Concern.findOne({ concernId });
    if (!concern) return res.status(404).json({ message: "Concern not found" });

    // ✅ Fetch user email based on `userId`
    const user = await User.findOne({ userId: concern.userId }).select("userEmail fullName");
    if (!user || !user.userEmail) {
      return res.status(400).json({ message: "User email not found in database" });
    }

    concern.status = "Rejected";
    await concern.save();

    // ✅ Send rejection email
    const emailSubject = "Your Concern Has Been Rejected";
    const emailBody = `
      Hello ${user.fullName},
      \nYour concern with subject ${concern.subject}has been rejected.
      
    \nThank you!
    `;
    await sendEmail(user.userEmail, emailSubject, emailBody);

    res.status(200).json({ message: "Concern rejected & email sent.", concern });
  } catch (error) {
    console.error("Error rejecting concern:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
