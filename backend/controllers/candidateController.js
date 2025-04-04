import mongoose from "mongoose";
import axios from "axios";
import FormData from "form-data";
import Candidate from "../models/candidateModel.js";
import Announcement from "../models/announcementModel.js";
import sendEmail from "../utils/sendEmail.js"; // Adjust the path if needed
import { fastApiUrl } from '../config.js';
import Department from "../models/departmentsModel.js";

export const createCandidate = async (req, res) => {
  try {
    // 🔹 Validate required files
    if (!req.files || !req.files.candidateDocuments || !req.files.candidatePicture) {
      return res.status(400).json({ message: "Both identity proof and picture are required." });
    }

    // 🔹 Validate required fields
    const requiredFields = [
      "email", "firstName", "surName", "dob", "age", "phone",
      "nationality", "gender", "maritalStatus", "languagesKnown",
      "position", "departmentId",
      "announcementId", "skills", "specialization"
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required.` });
      }
    }

    // 🔹 Check if candidate has already applied for this announcement
    const existingCandidate = await Candidate.findOne({
      email: req.body.email,
      announcementId: req.body.announcementId,
    });

    if (existingCandidate) {
      return res.status(400).json({
        message: "You have already applied for this job announcement.",
      });
    }

    const candidateDocuments = req.files?.candidateDocuments?.[0]?.path || null;
    const candidatePicture = req.files?.candidatePicture?.[0]?.path || null;

    if (!candidateDocuments || !candidatePicture) {
      return res.status(400).json({ message: "Both identity proof and picture are required." });
    }

    // 🔹 Fetch Job Details from Announcement Model
    const announcement = await Announcement.findOne({ announcementId: req.body.announcementId });

    if (!announcement) {
      return res.status(400).json({ message: "Invalid job announcement." });
    }

    // 🔹 Parse education qualifications safely
    let educationQualification = req.body.educationQualification;
    if (typeof educationQualification === "string") {
      try {
        educationQualification = JSON.parse(educationQualification);
      } catch (error) {
        return res.status(400).json({ message: "Invalid education qualification format." });
      }
    }

    if (!Array.isArray(educationQualification)) {
      return res.status(400).json({ message: "Education qualification should be an array." });
    }

    // ✅ Format educationQualification into a readable string
    const formattedEducation = educationQualification
      .map((edu) => {
        const field = edu.field || "Unknown Field";
        const fieldOfStudy = edu.fieldOfStudy || "N/A";
        const schoolOrCollege = edu.schoolName || edu.collegeName || "Unknown Institution";
        const year = edu.yearOfPassing || "N/A";
        return `${field} in ${fieldOfStudy} (${schoolOrCollege}, ${year})`;
      })
      .join(", ");
    // 🔹 Prepare data for FastAPI analysis
    const formData = new FormData(); // ✅ Correctly create FormData instance

    formData.append("job_position", req.body.position);
    formData.append("job_description", announcement.jobDescription);
    formData.append("candidate_email", req.body.email);
    formData.append("skills", req.body.skills);
    formData.append("specialization", req.body.specialization);
    formData.append("responsibilities", req.body.responsibilities || "Not Specified");
    formData.append("totalYearsOfExperience", req.body.totalYearsOfExperience || "0");    
    formData.append("educationQualification", formattedEducation);
    formData.append("requiredExperience", announcement.requiredExperience || "Not Specified");
    formData.append("skillsRequired", JSON.stringify(announcement.skillsRequired || []));
    formData.append("educationQualificationRequired", announcement.educationQualification || "Not Specified");


    const fastApiResponse = await axios.post(fastApiUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const candidateEvaluation = fastApiResponse.data.candidateEvaluation;
    const detailedEvaluation = fastApiResponse.data.detailedEvaluation; 

    // 🔹 Generate Candidate ID
    const lastCandidate = await Candidate.findOne().sort({ _id: -1 });
    let nextCandidateId = "CA1";

    if (lastCandidate && lastCandidate.candidateId) {
      const lastNumber = parseInt(lastCandidate.candidateId.replace("CA", ""), 10);
      nextCandidateId = `CA${lastNumber + 1}`;
    }
  
    // 🔹 Create Candidate with Full Evaluation (Including Education in DB)
    const candidate = new Candidate({
      candidateId: nextCandidateId,
      firstName: req.body.firstName,
      fatherName: req.body.fatherName,
      surName: req.body.surName,
      email: req.body.email,
      phone: req.body.phone,
      dob: req.body.dob,
      age: req.body.age,
      nativePlace: req.body.nativePlace,
      nationality: req.body.nationality,
      gender: req.body.gender,
      maritalStatus: req.body.maritalStatus,
      languagesKnown: req.body.languagesKnown,
      candidateDocuments,
      candidatePicture,
      presentAddress: req.body.presentAddress,
      permanentAddress: req.body.permanentAddress,
      educationQualification,
      position: req.body.position,
      departmentId: req.body.departmentId,
      announcementId: req.body.announcementId,
      skills: req.body.skills,
      specialization: req.body.specialization,
      salary: req.body.salary,
      lastWorkPlace: req.body.lastWorkPlace || "",
      yearsOfExperience: req.body.yearsOfExperience || "0",
      addressOfWorkPlace: req.body.addressOfWorkPlace || "",
      responsibilities: req.body.responsibilities || "",
      referenceContact: req.body.referenceContact || "",
      totalYearsOfExperience: req.body.totalYearsOfExperience,
      confirmInformation: req.body.confirmInformation === "true",
      candidateEvaluation, // ✅ Store total evaluation score
      detailedEvaluation, // ✅ Store full detailed evaluation (including education) in DB
    });
    
    await candidate.save();
  
    // 🔹 Send email notification with evaluation breakdown (excluding education)
    const emailSubject = "Job Application Successfully Sent";
    const emailMessage = `Dear ${req.body.firstName},
    
    Your job application has been successfully submitted.
    
    Candidate ID: ${nextCandidateId}
    Evaluation Score: ${candidateEvaluation}%

    Thank you for applying!
    
    Best Regards,
    Recruitment Team`;
    
    await sendEmail(req.body.email, emailSubject, emailMessage);    
    
    res.status(201).json({
      message: "Candidate added successfully",
      candidateId: candidate.candidateId,
      candidateEvaluation,
    });

  } catch (error) {
    console.error("❌ Error adding candidate:", error);
    res.status(500).json({ message: "Error adding candidate", error });
  }
};

export const getCandidateList = async (req, res) => {
  try {
    const { announcementId } = req.body;

    if (!announcementId) {
      return res.status(400).json({ error: "announcementId is required" });
    }

    // Find announcement details using announcementId
    const announcement = await Announcement.findOne({ announcementId });

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    const { jobPosition, departmentId } = announcement;

    const departmentInfo = await Department.findOne({ departmentid: departmentId });
    const departmentName = departmentInfo ? departmentInfo.departmentName : "Unknown Department";

    if (!jobPosition || !departmentId || !departmentName) {
      return res.status(400).json({ error: "Job position or departmentId is missing in announcement" });
    }

    // Find candidates matching job position and department
    const candidates = await Candidate.find(
      { position: jobPosition, departmentId: departmentId },
      "candidateId firstName fatherName surName email phone dob confirmationStatus age nativePlace nationality candidatePerformance gender maritalStatus languagesKnown candidateDocuments candidatePicture presentAddress permanentAddress educationQualification position departmentId skills specialization salary lastWorkPlace yearsOfExperience addressOfWorkPlace responsibilities referenceContact totalYearsOfExperience confirmInformation announcementId selected result recruited candidateEvaluation detailedEvaluation pastEmails"
    );

    // Convert file paths to URLs
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const formattedCandidates = candidates.map(candidate => ({
      ...candidate._doc,
      departmentId,
      departmentName, // Include departmentName in the candidate data
      candidatePicture: candidate.candidatePicture 
        ? `${baseUrl}/${candidate.candidatePicture}`.replace(/\\/g, "/") 
        : null,
      candidateDocuments: candidate.candidateDocuments 
        ? `${baseUrl}/${candidate.candidateDocuments}`.replace(/\\/g, "/") 
        : null
    }));
    
    res.status(200).json(formattedCandidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
};

export const selectCandidatesUpdate = async (req, res) => {
  try {
    const { candidateIds, selected } = req.body;

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ message: "No candidates selected" });
    }

    // Build update query
    const updateQuery = { $set: { selected } };

    // ✅ If deselecting candidates, explicitly set result to false
    if (!selected) {
      updateQuery.$set.result = false; 
    }

    // ✅ Update selection state
    const updatedCandidates = await Candidate.updateMany(
      { candidateId: { $in: candidateIds } }, // Match candidates by ID
      updateQuery
    );

    if (updatedCandidates.modifiedCount === 0) {
      return res.status(404).json({ message: "Candidates not found" });
    }

    res.status(200).json({ message: `Candidates ${selected ? "selected" : "deselected"} successfully` });
  } catch (error) {
    console.error("Error updating candidates:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch candidate details by ID (POST method)
export const getCandidateById = async (req, res) => {
  try {
    const { candidateId } = req.body; // Get candidateId from request body

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    // Find candidate in the database
    const candidate = await Candidate.findOne({ candidateId });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    res.status(200).json(candidate); // Send candidate data as response
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCandidateByIdAndDepartment = async (req, res) => {
  try {
    const { candidateId } = req.body; // Get candidateId from request body

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    // Find candidate in the database
    const candidate = await Candidate.findOne({ candidateId }).lean();

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Fetch department name using departmentId
    const department = await Department.findOne({ departmentId: candidate.departmentId }).select("departmentName").lean();

    // Attach department name without modifying departmentId
    res.status(200).json({
      ...candidate,
      departmentName: department ? department.departmentName : "Unknown Department",
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const toggleApproval = async (req, res) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
        return res.status(400).json({ message: "Candidate ID is required" });
    }

    // ✅ Find candidate
    const candidate = await Candidate.findOne({ candidateId });
    if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
    }

    // ✅ Toggle `result` field (Approve/Rescind)
    candidate.result = !candidate.result;

    // ✅ Reset `confirmationDeadline` and `confirmationStatus`
    candidate.confirmationDeadline = null;
    candidate.confirmationStatus = "No";

    await candidate.save();

    res.status(200).json({
        message: `Candidate ${candidate.result ? "approved" : "rescinded"} successfully`,
        newStatus: candidate.result
    });
  } catch (error) {
      console.error("Error updating candidate status:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

// Helper function to check if the confirmation deadline is still valid
const isDeadlineValid = (deadline) => {
  if (!deadline) return false; // No deadline set
  const currentDate = new Date();
  const deadlineDate = new Date(deadline);
  return currentDate <= deadlineDate;
};

export const searchCandidate = async (req, res) => {
  try {
    const { email, candidateId, searchId } = req.body;

    // Validate `searchId` as an ObjectId (if provided)
    if (searchId && !mongoose.Types.ObjectId.isValid(searchId)) {
      return res.status(400).json({ message: "Invalid Search ID." });
    }

    // Search candidate in DB
    const candidate = await Candidate.findOne({ email, candidateId });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    // ✅ Ensure `result` is TRUE before allowing the search
    if (!candidate.result) {
      return res.status(400).json({ message: "You have not received a job letter." });
    }

    // ✅ Validate confirmation deadline
    if (!isDeadlineValid(candidate.confirmationDeadline)) {
      return res.status(400).json({ message: "⚠️ Confirmation deadline has expired." });
    }

    // ✅ Check if already confirmed or declined
    if (candidate.confirmationStatus !== "Pending") {
      return res.status(400).json({ message: "⚠️ Candidate has already confirmed or declined." });
    }

    // ✅ Send job details
    res.status(200).json({
      message: "✅ Candidate found and eligible.",
      candidateName: `${candidate.firstName} ${candidate.surName}`,
      position: candidate.position,
      departmentId: candidate.departmentId,
      salary: candidate.salary,
      confirmationDeadline: candidate.confirmationDeadline,
    });
  } catch (error) {
    console.error("Error in searchCandidate:", error);
    res.status(500).json({ message: "❌ Server error." });
  }
};

export const confirmJobOffer = async (req, res) => {
  const { email, candidateId, decision } = req.body;

  // Validate input
  if (!email || !candidateId || !decision) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // Find the candidate
    const candidate = await Candidate.findOne({ email, candidateId });

    if (!candidate) {
      return res.status(404).json({ message: 'Job offer not found.' });
    }

    // Process the decision
    if (decision === 'accepted') {
      candidate.confirmationStatus = 'Accepted';
      candidate.recruited = true;  // Mark as recruited
    } else if (decision === 'declined') {
      candidate.confirmationStatus = 'Declined';
    } else {
      return res.status(400).json({ message: 'Invalid decision. Choose "accepted" or "declined".' });
    }

    // Save the updated candidate
    await candidate.save();

    // Respond with a success message
    res.status(200).json({
      message: `Job offer has been ${decision === 'accepted' ? 'accepted' : 'declined'} successfully.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing the decision.' });
  }
};