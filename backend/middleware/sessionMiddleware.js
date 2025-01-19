import session from 'express-session';
import MongoStore from 'connect-mongo'; // Optional for persistent sessions
import { mongoURI } from '../config.js';

export const sessionMiddleware = session({
  secret: 'your-secret-key', // Use a strong secret key
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoURI }), // Optional: Use MongoDB to store sessions
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutes
    httpOnly: true,
    sameSite: 'Lax', // Prevent CSRF
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  },
});
