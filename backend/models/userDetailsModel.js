import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema({
  userdetailsId: { type: String, unique: true, required: true },
  userId: { type: String, required: true, ref: "User" }, // Foreign key linking to tableUser
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
  nativePlace: { type: String, required: true },
  nationality: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
  maritalStatus: { type: String, required: true, enum: ["Unmarried", "Married", "Divorced", "Widowed"] },
  languagesKnown: [{ type: String, required: true }], // Array of languages
  identityProof: { type: String, required: true },
  picture: { type: String }, // Optional field (stores image URL or base64)
  presentAddress: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  createdBy: { type: String, required: true, ref: "User" }, // Set from session userId
});

export default mongoose.model("UserDetails", userDetailsSchema, "tableUserDetails");
