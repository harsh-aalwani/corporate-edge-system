import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema({
    userdetailsId: { type: String, unique: true, required: true },
    userId: { type: String, required: true, ref: "User" }, // Foreign key linking to tableUser
    dob: { type: Date, required: true },
    age: { type: Number, required: false },
    nativePlace: { type: String, required: true },
    nationality: { type: String, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    maritalStatus: { type: String, required: true, enum: ["Unmarried", "Married", "Divorced", "Widowed"] },
    languagesKnown: [{ type: String, required: true }], // Array of languages
    identityProof: { type: String, required: true },
    picture: { type: String }, // Optional field (stores image URL or base64)
    presentAddress: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    educationQualification: [{
      field: { type: String, required: true },
      fieldOfStudy: { type: String },
      nameOfBoard: { type: String },
      schoolName: { type: String },
      nameOfUniversity: { type: String },
      collegeName: { type: String },
      marksObtained: { type: String },
      outOf: { type: String },
      percentage: { type: String },
      noOfAttempts: { type: String },
      yearOfPassing: { type: String, required: true },
    }], // ✅ Store array of objects instead of strings
    specialization: { type: String, required: true },
    lastWorkPlace: { type: String, required: false },
    yearsOfExperience: { type: Number, required: false },
    addressOfWorkPlace: { type: String, required: false },
    responsibilities: { type: String, required: false },
    referenceContact: { type: String, required: false },
    totalYearsOfExperience: { type: Number, required: false },
    createdBy: { type: String, required: true, ref: "User" }, // Set from session userId
  });
  

export default mongoose.model("UserDetails", userDetailsSchema, "tableUserDetails");
