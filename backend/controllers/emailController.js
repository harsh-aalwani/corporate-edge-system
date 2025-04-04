import path from "path";
import fs from "fs";
import linkTextSendEmail from "../utils/linkTextSendEmail.js";
import Candidate from "../models/candidateModel.js";
import User from "../models/userModel.js";
import Department from "../models/departmentsModel.js"; // ✅ Import Department Model
import sendEmail from "../utils/sendEmail.js";
import { EMAIL_USER,CAPTCHA_SECRET } from "../config.js";
import axios from 'axios';

export const contactUs = async (req, res) => {
    const { name, email, message, captchaToken } = req.body;

    if (!name || !email || !message || !captchaToken) {
        return res.status(400).json({ message: "All fields and CAPTCHA verification are required." });
    }

    try {
        // 🔍 **Verify CAPTCHA with Google**
        const captchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: CAPTCHA_SECRET, // Secret key from Google reCAPTCHA
                response: captchaToken,
            },
        });

        if (!captchaResponse.data.success) {
            return res.status(400).json({ message: "CAPTCHA verification failed. Please try again." });
        }

        // ✅ CAPTCHA Passed - Proceed with Email
        const senderSubject = "Confirmation: Your message has been received";
        const senderBody = `Dear ${name},\n\nThank you for reaching out! We have received your message and will get back to you soon.\n\nBest regards,\nSupport Team`;

        await sendEmail(email, senderSubject, senderBody);

        const adminSubject = `New Contact Form Submission from ${name}`;
        const adminBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

        await sendEmail(EMAIL_USER, adminSubject, adminBody);

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Email or CAPTCHA error:", error);
        res.status(500).json({ message: "Error processing request" });
    }
};

// ✅ Function to replace placeholders dynamically
const replacePlaceholders = (text, placeholders) => {
    return text.replace(/\[\[(.*?)\]\]/g, (_, key) => {
        const cleanKey = key.trim();
        return placeholders.hasOwnProperty(cleanKey) ? placeholders[cleanKey] : `[${cleanKey} Not Found]`;
    });
};

const sendEmails = async (req, res) => {
    try {
        const { subject, emailBody, recipients, placeholderData, deadline, selectedTemplate } = req.body;
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

        // ✅ Process attachments correctly
        const attachments = req.files?.map(file => ({
            filename: file.originalname,
            path: path.resolve("uploads/Candidate/emails", file.filename),
        })) || [];

        // ✅ Determine Deadline (Set Default if Missing)
        const finalDeadline = deadline?.trim() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        // ✅ Iterate through recipients and process placeholders server-side
        for (const recipient of parsedRecipients) {
            const candidate = await Candidate.findOne({ candidateId: String(recipient.candidateId) });

            if (!candidate) {
                console.warn(`⚠️ Candidate not found: ${recipient.candidateId}`);
                continue;
            }

            // ✅ Update candidate's confirmationDeadline & confirmationStatus
            candidate.confirmationDeadline = finalDeadline;
            candidate.confirmationStatus = "Pending";

            // ✅ Store `selectedTemplate` in `pastEmails` only if it exists
            if (selectedTemplate && selectedTemplate.trim()) {
                candidate.pastEmails.push(selectedTemplate.trim());
            }

            await candidate.save();

            // ✅ Fetch department details using departmentId
            let departmentName = "[DepartmentName Not Found]";
            if (candidate.departmentId) {
                const department = await Department.findOne({ departmentid: candidate.departmentId });
                if (department) {
                    departmentName = department.departmentName;
                }
            }

            // ✅ Generate a job confirmation link dynamically (Include Deadline)
            const jobConfirmationLink = `http://localhost:3000/CandidateConfirmation`;

            // ✅ Candidate Data for Placeholder Replacement
            const candidateDetails = {
                "CandidateName": candidate.firstName && candidate.surName
                    ? `${candidate.firstName} ${candidate.surName}`
                    : "[CandidateName Not Found]",
                "JobTitle": candidate.position || "[JobTitle Not Found]",
                "DepartmentName": departmentName,
                "JobConfirmationLink": `<a href="${jobConfirmationLink}" target="_blank">Accept now</a>`,
                "DeadlineDate": finalDeadline, // ✅ Add DeadlineDate Placeholder
                "CandidatesSearchID": `${candidate.candidateId} | ${candidate._id}` // ✅ Add candidateId and ObjectId
            };


            // ✅ Company & Contact Information from `placeholderData`
            const companyDetails = {
                "CompanyName": parsedPlaceholderData?.CompanyName?.trim() || "[CompanyName Not Found]",
                "OfficeAddress": parsedPlaceholderData?.OfficeAddress?.trim() || "[OfficeAddress Not Found]",
                "CompanyEmail": parsedPlaceholderData?.CompanyEmail?.trim() || "[CompanyEmail Not Found]"
            };

            // ✅ Merge placeholders
            const allPlaceholders = { ...candidateDetails, ...senderDetails, ...companyDetails };

            // ✅ Replace placeholders dynamically, including [[DeadlineDate]]
            const finalSubject = replacePlaceholders(subject, allPlaceholders);
            const finalEmailBody = replacePlaceholders(emailBody, allPlaceholders);

            // ✅ Send email **with correct parameters**
            await linkTextSendEmail(recipient.email, finalSubject, finalEmailBody, finalEmailBody, attachments);
            console.log(`✅ Email sent to: ${recipient.email} (Deadline: ${finalDeadline})`);
        }

        res.status(200).json({ message: "Emails sent successfully with updated placeholders, deadline, confirmation status, and optional stored template!" });
    } catch (error) {
        console.error("❌ Error sending emails:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export { sendEmails };
