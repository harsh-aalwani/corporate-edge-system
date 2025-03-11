import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config.js"; // Import from config.js

const sendEmail = async (recipients, subject, message, attachments = []) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: EMAIL_USER,
    to: recipients, // Supports multiple recipients (array or comma-separated string)
    subject: subject,
    text: message,
    attachments: attachments.length > 0 ? attachments : undefined, // Attach files if provided
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
