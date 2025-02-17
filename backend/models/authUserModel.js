import mongoose from 'mongoose';

const authUserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  otp: { type: String },
  otpExpiration: { type: Date },
});

// Force Mongoose to use "tableAuthUser" as the collection name
const AuthUser = mongoose.model("AuthUser", authUserSchema, "tableAuthUser");

export default AuthUser;
