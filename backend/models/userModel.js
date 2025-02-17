import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  userEmail: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  userMobileNumber: { type: String, maxlength: 12, required: true },
  userStatus: { type: Boolean, default: false },
  userPassword: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,  // Increased maxlength to accommodate bcrypt hashes
  },
  userRoleid: { type: String, required: true },
  userDepartment: { type: String, required: true },
  userPermissions: { type: Object, default: { SystemAdminExtra: false } },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema, 'tableUser');
