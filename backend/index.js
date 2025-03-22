import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { createServer } from 'http';
import { PORT, mongoURI } from './config.js';
import userRoutes from './routes/userRoutes.js';
import manageRoutes from './routes/manageRoutes.js';
import departmentsRoutes from './routes/departmentsRoutes.js';
import authUserRoutes from './routes/authUserRoutes.js';
import announcementRoutes from "./routes/announcementRoutes.js";
import concernRoutes from "./routes/concernRoutes.js";
import appraisalRoutes from "./routes/appraisalRoutes.js";
import leaveAllocationRoutes from "./routes/leaveAllocationRoutes.js"
import leaveRoutes from "./routes/leaveRoutes.js"; 
import policyRoutes from "./routes/policyRoutes.js";
import scheduleRoutes from './routes/scheduleRoutes.js';
import candidateRoutes from "./routes/candidateRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import candidatePerformanceRoutes from './routes/candidatePerformanceRoutes.js';
import { sessionMiddleware } from './middleware/sessionMiddleware.js';
import initializeSocket from './socket/socketHandler.js'; // Import socket handler
import { fileURLToPath } from "url";

const app = express();
const server = createServer(app); // Create HTTP server
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware setup
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(express.json());
app.use(sessionMiddleware);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/manage', manageRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/authuser', authUserRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/candPerformance", candidatePerformanceRoutes);
app.use("/api/candidates",candidateRoutes);
app.use("/api/leaves", leaveRoutes); 
app.use("/api/policies", policyRoutes);
app.use("/api/concern", concernRoutes);
app.use("/api/appraisals", appraisalRoutes);
app.use("/api/leaveAllocation", leaveAllocationRoutes);
app.use("/api/schedules", scheduleRoutes);

// Initialize Socket.IO
initializeSocket(server);
// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Database connection
mongoose
  .connect(mongoURI)
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
