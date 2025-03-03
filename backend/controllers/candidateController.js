import Candidate from "../models/candidateModel.js";

export const createCandidate = async (req, res) => {
  try {
    // Validate if the files are received
    if (!req.files || !req.files.candidateDocuments || !req.files.candidatePicture) {
      return res.status(400).json({ message: "Both identity proof and picture are required." });
    }

    // Ensure the email is present
    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // Extract file paths
    const candidateDocuments = req.files?.candidateDocuments?.[0]?.path || null;
    const candidatePicture = req.files?.candidatePicture?.[0]?.path || null;

    // Validate files existence
    if (!candidateDocuments || !candidatePicture) {
      return res.status(400).json({ message: "Both identity proof and picture are required." });
    }

    // Parse and validate JSON fields (if any)
    const educationQualification = req.body.educationQualification
      ? JSON.parse(req.body.educationQualification)
      : [];

    const candidate = new Candidate({
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
      skills: req.body.skills,
      specialization: req.body.specialization,
      salary: req.body.salary,
      lastWorkPlace: req.body.lastWorkPlace,
      yearsOfExperience: req.body.yearsOfExperience,
      addressOfWorkPlace: req.body.addressOfWorkPlace,
      responsibilities: req.body.responsibilities,
      referenceContact: req.body.referenceContact,
      totalYearsOfExperience: req.body.totalYearsOfExperience,
      confirmInformation: req.body.confirmInformation === "true",
    });

    // Save the candidate data
    await candidate.save();
    res.status(201).json({ message: "Candidate added successfully" });
  } catch (error) {
    console.error("❌ Error adding candidate:", error);
    res.status(500).json({ message: "Error adding candidate", error });
  }
};
