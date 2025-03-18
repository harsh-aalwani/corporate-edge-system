import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config.js"; // Import from config.js

const sendEmail = async (email, subject, message, htmlMessage = null) => {
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
    text: message, // Plain text fallback
    html: htmlMessage || message, // HTML content (if provided)
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
