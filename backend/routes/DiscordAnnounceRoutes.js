// backend/routes/DiscordAnnounceRoutes.js
import express from "express";
import { sendAnnouncement } from "../controllers/DiscordAnnounceController.js";

const router = express.Router();

// POST route for sending an announcement
router.post("/send-announcement", sendAnnouncement);

export default router;
