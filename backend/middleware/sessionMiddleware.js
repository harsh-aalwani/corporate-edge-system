import session from 'express-session';
import MongoStore from 'connect-mongo';
import { mongoURI, SESSION_SECRET_KEY } from '../config.js'; // Import `mongoURI` from config.js

export const sessionMiddleware = session({
  secret: SESSION_SECRET_KEY, // Use a strong secret key
  resave: false,
  saveUninitialized: false,
  rolling: true, // Refresh session on each request
  store: MongoStore.create({
    mongoUrl: mongoURI, // Use `mongoURI` from config.js
    ttl: 2 * 24 * 60 * 60, // 2 days (172800 seconds)
  }),
  cookie: {
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    secure: false, // Set to true if using HTTPS in production
    httpOnly: true,
  },
});
