import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config.js"; // Import from config.js

const linkTextSendEmail = async (email, subject, textMessage, htmlMessage = null, attachments = []) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: subject,
        text: textMessage, // Plain text fallback
        html: htmlMessage || textMessage, // HTML content (if provided)
        attachments: attachments.length > 0 ? attachments : [], // ✅ Properly attach files
    };

    await transporter.sendMail(mailOptions);
};

export default linkTextSendEmail;
