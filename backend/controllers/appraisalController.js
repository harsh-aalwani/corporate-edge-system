import User from "../models/userModel.js";
import EmployeeAppraisalModel from "../models/EmployeeAppraisalModel.js";  // ✅ Ensure correct import

import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { Buffer } from "buffer";
import sendEmail from "../utils/sendEmail.js"; // ✅ Import email function


// Ensure the `uploads/signatures` directory exists
const signatureDir = path.join("uploads", "signatures");
if (!fs.existsSync(signatureDir)) {
  fs.mkdirSync(signatureDir, { recursive: true });
}

// Ensure the `uploads/reports` directory exists
const reportsDir = path.join("uploads", "reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// ✅ Function to generate a proper `AP1, AP2, AP3` formatted appraisalId


// ✅ Function to convert signature from Base64 to image file
const saveSignatureImage = (base64Data, appraisalId) => {
  try {
    if (!base64Data.startsWith("data:image/png;base64,")) {
      throw new Error("Invalid signature format");
    }

    const base64String = base64Data.replace(/^data:image\/png;base64,/, "");
    const signatureFilename = `${appraisalId}.png`; // ✅ Use Appraisal ID as filename
    const signaturePath = path.join(signatureDir, signatureFilename);
    fs.writeFileSync(signaturePath, Buffer.from(base64String, "base64"));

    return signaturePath; // ✅ Return path of saved signature
  } catch (error) {
    console.error("Error saving signature:", error);
    return null;
  }
};

// ✅ Create Appraisal
// Function to generate a unique Appraisal ID
const generateAppraisalId = async () => {
  const lastAppraisal = await EmployeeAppraisalModel.findOne().sort({ createdAt: -1 });

  if (!lastAppraisal || !lastAppraisal.appraisalId) {
      return "AP1"; // If no previous record, start with "AP1"
  }

  const lastId = parseInt(lastAppraisal.appraisalId.replace("AP", ""), 10);
  return `AP${lastId + 1}`;
};
export const createAppraisal = async (req, res) => {
  console.log("🔍 Checking session data at Appraisal Submission:", req.session);

  if (!req.session || !req.session.userId) {
    console.log("❌ User session not found!");
    return res.status(401).json({ message: "User not logged in" });
  }

  console.log("✅ User is logged in:", req.session.userId);

  try {
    const {
      appraisalDate, achievements, goalsAchieved, nextGoals,
      trainingNeeds, challengesFaced, feedbackSuggestions,
      employeeAcknowledgment, name, employeeId,
     // ✅ Corrected spelling
      department, designation, dateOfJoining
    } = req.body;

    console.log("✅ Received Employee ID from Request:", employeeId);
    console.log("✅ Session User ID:", req.session.userId);

    if (req.session.userId !== employeeId) {
      console.log("❌ Mismatch: Employee ID does not match session user!");
      return res.status(403).json({ message: "Unauthorized: Employee ID does not match session user." });
    }

    console.log("✅ Employee ID matches session user. Proceeding with submission...");

    // ✅ Generate Unique `appraisalId`
    let appraisalId;
    try {
      const lastAppraisal = await EmployeeAppraisalModel.findOne().sort({ createdAt: -1 });

      appraisalId = lastAppraisal && lastAppraisal.appraisalId
        ? `AP${parseInt(lastAppraisal.appraisalId.replace("AP", ""), 10) + 1}`
        : "AP1";

      console.log("✅ Generated Appraisal ID:", appraisalId);
    } catch (err) {
      console.error("❌ Error generating appraisalId:", err);
      return res.status(500).json({ message: "Error generating appraisal ID" });
    }

    // 🔹 Save File Paths
    let files = [];
    if (req.files?.files) {
      files = req.files.files.map((file) => file.filename); // ✅ Only file names
    }

    let signaturePath = null;
    if (req.body.signature && req.body.signature.startsWith("data:image/png;base64,")) {
      try {
        const base64String = req.body.signature.replace(/^data:image\/png;base64,/, "");
        const signatureDir = "uploads/signatures/";

        if (!fs.existsSync(signatureDir)) {
          fs.mkdirSync(signatureDir, { recursive: true });
        }

        const signatureFilename = `${appraisalId}.png`;
        signaturePath = path.join(signatureDir, signatureFilename);
        fs.writeFileSync(signaturePath, Buffer.from(base64String, "base64"));
        console.log(`✅ Signature saved successfully at: ${signaturePath}`);
      } catch (error) {
        console.error("❌ Error saving signature:", error);
      }
    }

    // 🔹 Create Appraisal Record
    console.log("📝 Creating appraisal record...");
    const newAppraisal = new EmployeeAppraisalModel({
      appraisalId,
      appraisalDate,
      achievements: Array.isArray(achievements) ? achievements : [achievements],
      files,
      goalsAchieved,
      nextGoals,
      trainingNeeds: Array.isArray(trainingNeeds) ? trainingNeeds : [trainingNeeds],
      challengesFaced,
      feedbackSuggestions,
      employeeAcknowledgment,
      name,
      employeeId,
      department,
      designation,
      dateOfJoining,
       // ✅ Corrected spelling
      signature: signaturePath,
      createdBy: req.session.userId,
    });

    console.log("🛠 Saving to database...");
    await newAppraisal.save();
    console.log("✅ Appraisal saved successfully!");

    // ✅ Generate Report after saving appraisal
    const reportPath = path.join("uploads/reports", `${appraisalId}_Appraisal_Report.pdf`);
    await generateAppraisalReport(newAppraisal, reportPath);
    console.log("📄 Report Path:", reportPath);

    // ✅ Update database with report path
    await EmployeeAppraisalModel.findByIdAndUpdate(newAppraisal._id, { reportUrl: reportPath });

    return res.status(201).json({
      message: "Appraisal submitted successfully!",
      appraisalId: newAppraisal.appraisalId,
      reportUrl: reportPath, // ✅ Send report URL in response
    });

  } catch (error) {
    console.error("❌ Error saving appraisal:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};




export const generateAppraisalReport = async (appraisal, filePath) => {
  try {
    if (!appraisal || !appraisal.appraisalId) {
      console.error("❌ Error: Appraisal data missing!");
      return;
    }

    // ✅ Ensure filePath is correctly defined
    if (!filePath) {
      filePath = path.join("uploads/reports", `${appraisal.appraisalId}_Appraisal_Report.pdf`);
    }

    console.log("📄 Generating PDF report for:", appraisal.appraisalId);
    console.log("💾 Expected Report Path:", filePath);

    // ✅ Ensure reports directory exists
    const reportsDir = "uploads/reports/";
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      console.log("✅ Reports directory created.");
    }

    // ✅ Check if report already exists
    if (fs.existsSync(filePath)) {
      console.log("✅ Report already exists at:", filePath);
      return filePath;
    }

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // 📝 **Title**
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#0056b3").text("EMPLOYEE APPRAISAL REPORT", { align: "center", underline: true });
    doc.moveDown(2);

    // 📌 **Employee Details Table**
    doc.fontSize(12).fillColor("#000");
    doc.rect(40, doc.y, 520, 25).fill("#0056b3").stroke();
    doc.fillColor("#fff").text("Employee Details", 45, doc.y + 7);
    doc.moveDown(2);

    const employeeDetails = [
      ["Employee Name", appraisal.name || "N/A"],
      ["Employee ID", appraisal.employeeId || "N/A"],
      ["Department", appraisal.department || "N/A"],
      ["Designation", appraisal.designation || "N/A"],
      ["Date of Joining", new Date(appraisal.dateOfJoining).toDateString()],
    ];

    employeeDetails.forEach((row, index) => {
      doc.fillColor(index % 2 === 0 ? "#f2f2f2" : "#ffffff")
        .rect(40, doc.y, 520, 20)
        .fill()
        .stroke();
      
      doc.fillColor("#000").text(row[0], 45, doc.y + 5);
      doc.text(row[1], 300, doc.y + 5);
      doc.moveDown(1);
    });

    doc.moveDown(1);

    // 📌 **Achievements Section**
    doc.rect(40, doc.y, 520, 25).fill("#0056b3").stroke();
    doc.fillColor("#fff").text("Achievements", 45, doc.y + 7);
    doc.moveDown(2);

    if (appraisal.achievements && appraisal.achievements.length > 0) {
      appraisal.achievements.forEach((ach, index) => {
        doc.fillColor(index % 2 === 0 ? "#f2f2f2" : "#ffffff")
          .rect(40, doc.y, 520, 20)
          .fill()
          .stroke();

        doc.fillColor("#000").text(`${index + 1}. ${ach}`, 45, doc.y + 5);
        doc.moveDown(1);
      });
    } else {
      doc.fillColor("#000").text("No achievements recorded.");
    }
    doc.moveDown(1);

    // 📌 **Goals Achieved**
    doc.rect(40, doc.y, 520, 25).fill("#0056b3").stroke();
    doc.fillColor("#fff").text("Goals Achieved", 45, doc.y + 7);
    doc.moveDown(2);
    doc.fillColor("#000").text(appraisal.goalsAchieved || "N/A");
    doc.moveDown(1);

    // 📌 **Next Goals**
    doc.rect(40, doc.y, 520, 25).fill("#0056b3").stroke();
    doc.fillColor("#fff").text("Goals for the Next Period", 45, doc.y + 7);
    doc.moveDown(2);
    doc.fillColor("#000").text(appraisal.nextGoals || "N/A");
    doc.moveDown(1);

    // 📌 **Training Needs**
    doc.rect(40, doc.y, 520, 25).fill("#0056b3").stroke();
    doc.fillColor("#fff").text("Training & Development Needs", 45, doc.y + 7);
    doc.moveDown(2);

    if (appraisal.trainingNeeds && appraisal.trainingNeeds.length > 0) {
      appraisal.trainingNeeds.forEach((need, index) => {
        doc.fillColor(index % 2 === 0 ? "#f2f2f2" : "#ffffff")
          .rect(40, doc.y, 520, 20)
          .fill()
          .stroke();

        doc.fillColor("#000").text(`${index + 1}. ${need}`, 45, doc.y + 5);
        doc.moveDown(1);
      });
    } else {
      doc.fillColor("#000").text("No training needs specified.");
    }
    doc.moveDown(1);

    // 📌 **Challenges Faced**
    doc.rect(40, doc.y, 520, 25).fill("#0056b3").stroke();
    doc.fillColor("#fff").text("Challenges Faced", 45, doc.y + 7);
    doc.moveDown(2);
    doc.fillColor("#000").text(appraisal.challengesFaced || "N/A");
    doc.moveDown(1);

    // 📌 **Feedback & Suggestions**
    doc.rect(40, doc.y, 520, 25).fill("#0056b3").stroke();
    doc.fillColor("#fff").text("Feedback & Suggestions", 45, doc.y + 7);
    doc.moveDown(2);
    doc.fillColor("#000").text(appraisal.feedbackSuggestions || "N/A");
    doc.moveDown(2);

    // 📌 **Signature**
    doc.rect(40, doc.y, 520, 25).fill("#0056b3").stroke();
    doc.fillColor("#fff").text("Employee Signature", 45, doc.y + 7);
    doc.moveDown(2);

    if (appraisal.signature) {
      const signaturePath = appraisal.signature;

      if (fs.existsSync(signaturePath)) {
        doc.image(signaturePath, 45, doc.y, { width: 150, height: 50 });
        doc.moveDown(2);
      } else {
        doc.fillColor("#000").text("Signature not found.");
        doc.moveDown(1);
      }
    } else {
      doc.fillColor("#000").text("No signature provided.");
      doc.moveDown(1);
    }

    // ✅ **Finalize PDF**
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        console.log("✅ Report successfully generated at:", filePath);
        resolve(filePath);
      });

      stream.on("error", (error) => {
        console.error("❌ Error writing PDF file:", error);
        reject(error);
      });
    });

  } catch (error) {
    console.error("❌ Error generating report:", error);
  }
};




export const downloadAppraisalReport = async (req, res) => {
  const { appraisalId } = req.params;
  const reportFileName = `${appraisalId}_Appraisal_Report.pdf`;
  const reportPath = path.join("uploads/reports", reportFileName);

  console.log("🔍 Checking for report:", reportPath);

  try {
    // ✅ Check if report file exists
    if (!fs.existsSync(reportPath)) {
      console.log("❌ Report file does not exist. Attempting to generate it...");

      // ✅ Fetch appraisal data from DB
      const appraisal = await EmployeeAppraisalModel.findOne({ appraisalId });

      if (!appraisal) {
        console.error("❌ Appraisal not found in DB!");
        return res.status(404).json({ message: "Appraisal not found in database" });
      }

      // ✅ Generate the report if missing
      await generateAppraisalReport(appraisal, reportPath);

      // 🔄 Check again if report is now generated
      if (!fs.existsSync(reportPath)) {
        console.error("❌ Report still missing after generation!");
        return res.status(500).json({ message: "Report generation failed" });
      }
    }

    // ✅ Serve the report
    res.download(reportPath, reportFileName, (err) => {
      if (err) {
        console.error("❌ Error sending report:", err);
        res.status(500).json({ message: "Error downloading report" });
      }
    });

  } catch (error) {
    console.error("❌ Error in report download:", error);
    res.status(500).json({ message: "Error downloading report", error: error.message });
  }
};




//insert code 
export const getUserDetails = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "User not logged in" });
    }

    const user = await User.findOne({ userId: req.session.userId }).select(
      "fullName userId userDepartment userDesignation createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      fullName: user.fullName,
      userId: user.userId,
      userDepartment: user.userDepartment,
      userDesignation: user.userDesignation,
      dateOfJoining: user.createdAt,     
        userEmail: user.userEmail,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// depatment manager 
// 📌 Fetch all appraisals
// ✅ Fetch All Appraisals
export const getAllAppraisals = async (req, res) => {
  try {
    // ✅ Fetch all appraisals and sort by latest first
    const appraisals = await EmployeeAppraisalModel.find().sort({ createdAt: -1 });

    // ✅ Ensure all appraisals have a status (default to 'pending' if missing)
    const updatedAppraisals = appraisals.map(appraisal => ({
      ...appraisal.toObject(),
      status: appraisal.status || "pending",
    }));

    res.status(200).json(updatedAppraisals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appraisals", error: error.message });
  }
};



// ✅ Schedule a Review
export const scheduleReview = async (req, res) => {
  try {
    const { userId, date, time, link } = req.body;

    console.log("📥 Received Review Data:", { userId, date, time, link });

    // ✅ Find Employee Appraisal by Employee ID
    const appraisal = await EmployeeAppraisalModel.findOne({ employeeId: userId });

    if (!appraisal) {
      console.log("❌ No Appraisal Found for Employee ID:", userId);
      return res.status(404).json({ message: "Appraisal not found!" });
    }

    // ✅ Fetch `userEmail` from `userModel`
    const user = await User.findOne({ userId });

    if (!user) {
      console.log("❌ No User Found for User ID:", userId);
      return res.status(404).json({ message: "User not found!" });
    }

    const userEmail = user.userEmail;
    console.log("✅ Found User Email:", userEmail);

    // ✅ Update Review Details
    appraisal.reviewDate = date;
    appraisal.reviewTime = time;
    appraisal.reviewLink = link;
    await appraisal.save();

    console.log("✅ Review Scheduled Successfully!");

    // ✅ Prepare Email Content
    const subject = "Your Performance Review is Scheduled";
    const message = `
      Dear ${user.fullName},

      Your performance review has been scheduled.

      📅 Date: ${date}
      🕒 Time: ${time}
      🔗 Meeting Link: ${link}

      Please make sure to attend the review on time.

      Best Regards,
      depatment manager  Team
    `;

    // ✅ Send Email
    await sendEmail(userEmail, subject, message);
    console.log(`📧 Email Sent to: ${userEmail}`);

    res.status(200).json({ message: "Review scheduled and email sent successfully!" });

  } catch (error) {
    console.error("❌ Error Scheduling Review:", error);
    res.status(500).json({ message: "Error scheduling review", error: error.message });
  }
};

// ✅ Submit Final Assessment

export const submitFinalAssessment = async (req, res) => {
  const { userId, finalAssessment, performanceRatings } = req.body;

  console.log("📥 Received Assessment Data:", req.body);

  if (!userId || !finalAssessment || !performanceRatings) {
    return res.status(400).json({ message: "Missing required fields!" });
  }

  try {
    const appraisal = await EmployeeAppraisalModel.findOne({ employeeId: userId });

    if (!appraisal) {
      return res.status(404).json({ message: "Appraisal not found!" });
    }

    appraisal.finalAssessment = finalAssessment;
    appraisal.performanceRatings = performanceRatings; // ✅ Store Ratings

    await appraisal.save();

    res.status(200).json({ message: "Final assessment saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving assessment:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



// ✅ Approve Appraisal

export const approveAppraisal = async (req, res) => {
  try {
    const { appraisalId } = req.params;
    const { remarks } = req.body;

    console.log(`🔍 Searching for Appraisal ID: ${appraisalId}`);

    // ✅ Find appraisal by `appraisalId`
    const appraisal = await EmployeeAppraisalModel.findOne({ appraisalId });

    if (!appraisal) {
      console.log("❌ Appraisal not found in database!");
      return res.status(404).json({ message: "Appraisal not found" });
    }

    // ✅ Check if already approved
    if (appraisal.status === "approved") {
      return res.status(400).json({ message: "Appraisal is already approved" });
    }

    // ✅ Find Employee Email from `User` model
    const user = await User.findOne({ userId: appraisal.employeeId });

    if (!user) {
      console.log("❌ User not found!");
      return res.status(404).json({ message: "User not found in database" });
    }

    // ✅ Approve Appraisal
    appraisal.status = "approved";
    appraisal.remarks = remarks; // ✅ Save remarks
    await appraisal.save();

    console.log(`✅ Appraisal Approved: ${appraisalId}`);

    // ✅ Send Email
    const subject = "Your Performance Appraisal has been Approved";
    const message = `Dear ${appraisal.name},\n\nYour appraisal has been approved.\n\nRemarks: ${remarks}\n\nBest Regards,\nHR Team`;

    await sendEmail(user.userEmail, subject, message);
    console.log(`📧 Email Sent to: ${user.userEmail}`);

    res.status(200).json({ message: "Appraisal approved and email sent successfully!" });

  } catch (error) {
    console.error("❌ Error in approveAppraisal:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Reject Appraisal
export const rejectAppraisal = async (req, res) => {
  try {
    const { appraisalId } = req.params;
    const { remarks } = req.body;

    console.log(`🔍 Searching for Appraisal ID: ${appraisalId}`);

    // ✅ Find appraisal by `appraisalId`
    const appraisal = await EmployeeAppraisalModel.findOne({ appraisalId });

    if (!appraisal) {
      console.log("❌ Appraisal not found in database!");
      return res.status(404).json({ message: "Appraisal not found" });
    }

    // ✅ Check if already rejected
    if (appraisal.status === "rejected") {
      return res.status(400).json({ message: "Appraisal is already rejected" });
    }

    // ✅ Find Employee Email from `User` model
    const user = await User.findOne({ userId: appraisal.employeeId });

    if (!user) {
      console.log("❌ User not found!");
      return res.status(404).json({ message: "User not found in database" });
    }

    // ✅ Reject Appraisal
    appraisal.status = "rejected";
    appraisal.remarks = remarks; // ✅ Save remarks
    await appraisal.save();

    console.log(`❌ Appraisal Rejected: ${appraisalId}`);

    // ✅ Send Email
    const subject = "Your Performance Appraisal has been Rejected";
    const message = `Dear ${appraisal.name},\n\nYour appraisal has been rejected.\n\nReason: ${remarks}\n\nBest Regards,\nHR Team`;

    await sendEmail(user.userEmail, subject, message);
    console.log(`📧 Rejection Email Sent to: ${user.userEmail}`);

    res.status(200).json({ message: "Appraisal rejected and email sent successfully!" });

  } catch (error) {
    console.error("❌ Error in rejectAppraisal:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

