import mongoose from "mongoose";
import UserSchedule from "../models/userScheduleModel.js"; 

export const createSchedule = async (req, res) => {
    try {
        const { title, description, date } = req.body;
        const userId = req.session.userId; // ✅ Get logged-in user from session
        
        
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const newSchedule = new UserSchedule({
            title,
            description,
            date,
            createdBy: userId, // ✅ Store as a string
        });

        await newSchedule.save();
        res.status(201).json({ message: "Schedule created successfully" });
    } catch (error) {
        console.error("Error creating schedule:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


  // ✅ Get User's Schedules
  export const getUserSchedules = async (req, res) => {
    try {
      const userId = req.session.userId; // ✅ Get logged-in user from session
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const schedules = await UserSchedule.find({ createdBy: userId }).sort({ date: 1 }); // ✅ Changed model reference
  
      res.status(200).json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };


// Delete Schedule
export const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.body; // 🔥 Get ID from request body

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid schedule ID" });
        }

        const deletedSchedule = await UserSchedule.findByIdAndDelete(id);

        if (!deletedSchedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
