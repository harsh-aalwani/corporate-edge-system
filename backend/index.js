import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { PORT, mongoURI } from './config.js';
import userRoutes from './routes/userRoutes.js';
import manageRoutes from './routes/manageRoutes.js';
import departmentsRoutes from './routes/departmentsRoutes.js';
import { sessionMiddleware } from './middleware/sessionMiddleware.js';
import initializeSocket from './socket/socketHandler.js'; // Import socket handler

const app = express();
const server = createServer(app); // Create HTTP server

// Middleware setup
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(express.json());
app.use(sessionMiddleware);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/manage', manageRoutes);
app.use('/api/departments', departmentsRoutes);

// Initialize Socket.IO
initializeSocket(server);

// Database connection
mongoose
  .connect(mongoURI)
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
