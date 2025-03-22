import mongoose from "mongoose";

const UserScheduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    createdBy: {
        type: String, // ✅ Ensure this is a string, NOT ObjectId
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserSchedule = mongoose.model("UserSchedule", UserScheduleSchema);
export default UserSchedule;
