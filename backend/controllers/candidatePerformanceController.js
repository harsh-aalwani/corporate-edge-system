import CandidatePerformance from "../models/candidatePerformanceModel.js";
import Candidate from "../models/candidateModel.js";

export const addPerformanceRecord = async (req, res) => {
    try {
        const { recordName, criteria, remarks, candidateAssessment, candidateId, averageScore } = req.body;

        if (!recordName || !criteria || !candidateAssessment || !candidateId || averageScore === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!req.session?.userId) {
            return res.status(401).json({ message: "Unauthorized: Session expired or invalid" });
        }

        // ✅ Find the Highest CAP ID and Increment It
        const lastRecord = await CandidatePerformance.findOne({ candidateId })
            .sort({ candidatePerformanceId: -1 }) // Sort by highest CAP number
            .select("candidatePerformanceId"); // Select only the ID

        let newPerformanceId = "CAP1"; // Default if no records exist
        if (lastRecord?.candidatePerformanceId) {
            const lastIdNumber = parseInt(lastRecord.candidatePerformanceId.replace("CAP", ""), 10);
            newPerformanceId = `CAP${lastIdNumber + 1}`;
        }

        // ✅ Save New Performance Record
        const newPerformanceRecord = new CandidatePerformance({
            candidatePerformanceId: newPerformanceId,
            createdBy: req.session.userId,
            recordName,
            criteria,
            remarks,
            candidateAssessment,
            candidateId,
            averageScore,
        });

        await newPerformanceRecord.save();

        // ✅ Fetch All Performance Records for Candidate
        const allRecords = await CandidatePerformance.find({ candidateId });

        // ✅ Calculate New Cumulative Average Score
        const totalScore = allRecords.reduce((sum, record) => sum + record.averageScore, 0);
        const newAverageScore = Math.round(totalScore / allRecords.length);

        // ✅ Update Candidate Model with the New Average Score (Stored Directly as a Number)
        await Candidate.updateOne(
            { candidateId }, 
            { $set: { candidatePerformance: newAverageScore } }
        );

        res.status(201).json({ 
            message: "Performance record added successfully", 
            newAverageScore 
        });

    } catch (error) {
        console.error("❌ Error adding performance record:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const fetchPreviousPerformanceRecords = async (req, res) => {
    try {
        const { candidateId } = req.body;

        if (!candidateId) {
            return res.status(400).json({ message: "Candidate ID is required." });
        }

        // 🔹 Fetch performance records from the database (sorted by latest)
        const performanceRecords = await CandidatePerformance.find({ candidateId })
            .sort({ createdAt: -1 });

        if (!performanceRecords.length) {
            return res.status(404).json({ message: "No performance records found for this candidate." });
        }

        // ✅ Get the latest assessment
        const latestAssessment = performanceRecords[0]?.candidateAssessment || "Not Available";

        res.status(200).json({ performanceRecords, latestAssessment });

    } catch (error) {
        res.status(500).json({ message: "Server error while fetching performance records." });
    }
};

export const deletePerformanceRecord = async (req, res) => {
    try {
        const { candidatePerformanceId, candidateId } = req.body;

        if (!candidatePerformanceId || !candidateId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        console.log(`🗑️ Deleting performance record: ${candidatePerformanceId} for candidate: ${candidateId}`);

        // ✅ Delete the specific performance record
        const deletionResult = await CandidatePerformance.deleteOne({ candidatePerformanceId });

        if (deletionResult.deletedCount === 0) {
            return res.status(404).json({ message: "Performance record not found." });
        }

        // ✅ Fetch remaining records to calculate new average
        const remainingRecords = await CandidatePerformance.find({ candidateId });

        let newAverageScore = 0;
        if (remainingRecords.length > 0) {
            const totalScore = remainingRecords.reduce((sum, record) => sum + record.averageScore, 0);
            newAverageScore = Math.round(totalScore / remainingRecords.length);
        }

        // ✅ Update candidate's stored performance score
        await Candidate.updateOne({ candidateId }, { $set: { candidatePerformance: newAverageScore } });

        console.log(`✅ Updated candidate ${candidateId} with new average score: ${newAverageScore}`);
        res.status(200).json({ message: "Performance record deleted successfully", newAverageScore });

    } catch (error) {
        console.error("❌ Error deleting performance record:", error);
        res.status(500).json({ message: "Server error while deleting performance record." });
    }
};

export const deleteAllPerformanceRecords = async (req, res) => {
    try {
        const { candidateId } = req.body;

        if (!candidateId) {
            return res.status(400).json({ message: "Candidate ID is required." });
        }

        console.log(`🗑️ Deleting ALL performance records for candidate: ${candidateId}`);

        // ✅ Delete all performance records for the candidate
        const deletionResult = await CandidatePerformance.deleteMany({ candidateId });

        if (deletionResult.deletedCount === 0) {
            return res.status(404).json({ message: "No performance records found to delete." });
        }

        // ✅ Reset candidate's stored performance score to 0
        await Candidate.updateOne({ candidateId }, { $set: { candidatePerformance: 0 } });

        console.log(`✅ Reset candidate ${candidateId} performance to 0.`);
        res.status(200).json({ message: "All performance records deleted successfully." });

    } catch (error) {
        console.error("❌ Error deleting all performance records:", error);
        res.status(500).json({ message: "Server error while deleting performance records." });
    }
};
