import { sendAnnouncement as sendBotAnnouncement } from "../bot.js";

export const sendAnnouncement = async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({ error: "Title and message are required." });
        }

        // Call bot function to send the announcement
        await sendBotAnnouncement(title, message);

        return res.status(200).json({ message: "✅ Announcement sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending announcement:", error.message);
        return res.status(500).json({ error: "Failed to send announcement." });
    }
};
