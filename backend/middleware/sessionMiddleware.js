  import session from 'express-session';
  import MongoStore from 'connect-mongo';
  import { mongoURI } from '../config.js'; // Import `mongoURI` from your config file

  export const sessionMiddleware = session({
    secret: 'GdViewQRQCviHrweeOVEpnpeR', // Use a strong secret key
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoURI, // Use `mongoURI` from config.js
      ttl: 30 * 60, // Time-to-live for sessions in seconds (30 minutes)
    }),
    cookie: {
      maxAge: 30 * 60 * 1000, // 30 minutes
      secure: false, // Set to true if using HTTPS in production
      httpOnly: true,
    },
  });
