import path from "path";
import fs from "fs";
import sendEmail from "../utils/multiSendEmail.js";
import Candidate from "../models/candidateModel.js";
import User from "../models/userModel.js";
import Department from "../models/departmentsModel.js"; // ✅ Import Department Model

// ✅ Function to replace placeholders dynamically
const replacePlaceholders = (text, placeholders) => {
    return text.replace(/\[\[(.*?)\]\]/g, (_, key) => {
        const cleanKey = key.trim();
        return placeholders.hasOwnProperty(cleanKey) ? placeholders[cleanKey] : `[${cleanKey} Not Found]`;
    });
};

const sendEmails = async (req, res) => {
    try {
        const { subject, emailBody, recipients, placeholderData } = req.body;
        const parsedRecipients = JSON.parse(recipients);
        const parsedPlaceholderData = JSON.parse(placeholderData); // ✅ Parse placeholder data

        if (!subject || !emailBody || parsedRecipients.length === 0) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!req.session?.userId) {
            return res.status(401).json({ message: "Unauthorized: Session expired or invalid" });
        }

        // ✅ Fetch sender details
        const sender = await User.findOne({ userId: req.session.userId });
        if (!sender) {
            return res.status(400).json({ message: "Sender details not found." });
        }

        const senderDetails = {
            "YourName": sender.fullName || "[YourName Not Found]",
            "YourPosition": sender.userDesignation || "[YourPosition Not Found]",
        };

        // ✅ Process attachments
        const attachments = req.files?.map(file => {
            const filePath = path.resolve("uploads/Candidate/emails", file.filename);
            return fs.existsSync(filePath) ? { filename: file.originalname, path: filePath } : null;
        }).filter(Boolean) || [];

        // ✅ Iterate through recipients and process placeholders server-side
        for (const recipient of parsedRecipients) {
            const candidate = await Candidate.findOne({ candidateId: String(recipient.candidateId) });

            if (!candidate) {
                console.warn(`⚠️ Candidate not found: ${recipient.candidateId}`);
                continue;
            }

            // ✅ Fetch department details using departmentId
            let departmentName = "[DepartmentName Not Found]";
            if (candidate.departmentId) {
                const department = await Department.findOne({ departmentid: candidate.departmentId });
                if (department) {
                    departmentName = department.departmentName;
                }
            }

            // ✅ Candidate Data for Placeholder Replacement
            const candidateDetails = {
                "CandidateName": candidate.firstName && candidate.surName
                    ? `${candidate.firstName} ${candidate.surName}`
                    : "[CandidateName Not Found]",
                "JobTitle": candidate.position || "[JobTitle Not Found]",
                "DepartmentName": departmentName, // ✅ Now replacing `[[DepartmentName]]`
            };

            // ✅ Company & Contact Information from `placeholderData`
            const companyDetails = {
                "CompanyName": parsedPlaceholderData?.CompanyName?.trim() || "[CompanyName Not Found]",
                "OfficeAddress": parsedPlaceholderData?.OfficeAddress?.trim() || "[OfficeAddress Not Found]",
                "CompanyEmail": parsedPlaceholderData?.CompanyEmail?.trim() || "[CompanyEmail Not Found]"
            };

            // ✅ Merge placeholders
            const allPlaceholders = { ...candidateDetails, ...senderDetails, ...companyDetails };

            // ✅ Replace placeholders dynamically
            const finalSubject = replacePlaceholders(subject, allPlaceholders);
            const finalEmailBody = replacePlaceholders(emailBody, allPlaceholders);

            // ✅ Send email **sequentially** (await)
            await sendEmail(recipient.email, finalSubject, finalEmailBody, attachments);
            console.log(`✅ Email sent to: ${recipient.email}`);
        }

        res.status(200).json({ message: "Emails sent successfully with updated placeholders!" });
    } catch (error) {
        console.error("❌ Error sending emails:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export { sendEmails };
