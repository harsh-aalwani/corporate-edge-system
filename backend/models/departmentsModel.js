import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
  departmentid: { type: String, unique: true, required: true },
  departmentName: { type: String, required: true, uppercase: true },
  departmentDescription: { type: String, required: true },
  createdAt: { type: Date, default: Date.now } // ✅ Auto timestamp
});


// Force Mongoose to use "tableDepartment" as the collection name
const Department = mongoose.model("Department", DepartmentSchema, "tableDepartment");

export default Department;
