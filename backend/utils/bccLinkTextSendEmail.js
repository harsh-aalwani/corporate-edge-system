import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config.js"; // Import from config.js

// Now attachments is an array of file objects.
const bccLinkTextSendEmail = async (
  subject,
  message,
  htmlMessage = null,
  bcc = [],
  attachments = []  // Accept any attachments here
) => {
  if (!subject) {
    subject = "📢 New Announcement"; // Ensure there's always a subject
  }

  if (!bcc || bcc.length === 0) {
    console.error("❌ No recipients provided for BCC email.");
    return { success: false, message: "No recipients provided." };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Company Announcements" <${EMAIL_USER}>`,
    to: "undisclosed-recipients:;", // Hide recipients
    bcc: bcc,
    subject: subject,
    text: message || "Please view this announcement.",
    html: htmlMessage ? htmlMessage : message,
    attachments: attachments, // Attach the provided files
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ BCC Email Sent: ${info.messageId} to ${bcc.length} recipients`);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("❌ Error sending BCC email:", error);
    return { success: false, message: "Email sending failed." };
  }
};

export default bccLinkTextSendEmail;
