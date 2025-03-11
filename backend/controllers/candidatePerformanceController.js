import CandidatePerformance from "../models/candidatePerformanceModel.js";

export const addPerformanceRecord = async (req, res) => {
    try {
        const { recordName, criteria, remarks, candidateAssessment, candidateId } = req.body;

        if (!recordName || !criteria || !candidateAssessment || !candidateId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!req.session?.userId) {
            return res.status(401).json({ message: "Unauthorized: Session expired or invalid" });
        }

        // ✅ Count existing records for candidateId to generate sequential ID
        const count = await CandidatePerformance.countDocuments({ candidateId });
        const candidatePerformanceId = `CAP1_${count + 1}`; // 🔹 Sequential ID

        const newPerformanceRecord = new CandidatePerformance({
            candidatePerformanceId,
            createdBy: req.session.userId, // 🔹 Set from session
            recordName,
            criteria,
            remarks,
            candidateAssessment,
            candidateId,
        });

        await newPerformanceRecord.save();
        res.status(201).json({ message: "Performance record added successfully", record: newPerformanceRecord });
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

        // 🔹 Fetch performance records from the database
        const performanceRecords = await CandidatePerformance.find({ candidateId });

        if (!performanceRecords.length) {
            return res.status(404).json({ message: "No performance records found for this candidate." });
        }

        res.status(200).json({ performanceRecords });
    } catch (error) {
        console.error("❌ Error fetching candidate performance data:", error);
        res.status(500).json({ message: "Server error" });
    }
};
