// index.js
import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import DiscordAnnounceRoutes from "./routes/DiscordAnnounceRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/discord", DiscordAnnounceRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
