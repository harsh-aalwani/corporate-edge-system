import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { PORT, mongoURI } from './config.js';
import userRoutes from './routes/userRoutes.js';
import manageRoutes from './routes/manageRoutes.js';
import { sessionMiddleware } from './middleware/sessionMiddleware.js';

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Update with your frontend URLs
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions)); // CORS middleware
app.use(express.json()); // Body parser middleware
app.use(sessionMiddleware); // Session middleware (must be before routes)

app.use('/api/users', userRoutes); 
app.use('/api/manage', manageRoutes);

// Database connection
mongoose
  .connect(mongoURI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
