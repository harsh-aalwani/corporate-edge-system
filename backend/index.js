import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser'; // Import cookie-parser
import { PORT, mongoURI } from './config.js';
import userRoutes from './routes/userRoutes.js';
import manageRoutes from './routes/manageRoutes.js';
import User from './models/userModel.js'; // Import the User model for updating status

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Update with your frontend URLs
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions)); // CORS middleware
app.use(express.json()); // Body parser middleware
app.use(cookieParser()); // Use cookie-parser middleware

// Middleware to update userStatus based on cookies (for online/offline tracking)
app.use(async (req, res, next) => {
  const { userId } = req.cookies; // Get userId from cookies
  if (userId) {
    try {
      // Update user status to online (True)
      await User.updateOne({ userId }, { userStatus: true });
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  }
  next();
});

// Middleware to log out and set status to offline (when logging out or session expires)
app.use(async (req, res, next) => {
  const { userId } = req.cookies;
  if (!userId) {
    next();
    return;
  }

  // Handle logout scenario or session expiration by setting userStatus to false
  res.on('finish', async () => {
    if (res.statusCode === 200 && req.method === 'POST') { // Check if logout
      try {
        await User.updateOne({ userId }, { userStatus: false });
      } catch (err) {
        console.error('Error setting user status to offline:', err);
      }
    }
  });
  next();
});

app.use('/api/users', userRoutes); 
app.use('/api/manage', manageRoutes);

// Database connection
mongoose
  .connect(mongoURI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
