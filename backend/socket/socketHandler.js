import { Server } from 'socket.io';
import { sessionMiddleware } from '../middleware/sessionMiddleware.js';
import User from '../models/userModel.js';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'], // Update with your frontend URLs
      credentials: true,
    },
  });

  // Middleware to access session inside socket.io
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', async (socket) => {
    if (!socket.request.session || !socket.request.session.userId) {
      console.log('No session found for socket connection');
      return;
    }

    const userId = socket.request.session.userId; // Get userId from session

    try {
      await User.findOneAndUpdate({ userId }, { userStatus: true });
      console.log(`User ${userId} connected`);

      socket.on('disconnect', async () => {
        await User.findOneAndUpdate({ userId }, { userStatus: false });
        console.log(`User ${userId} disconnected`);
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  });

  return io;
};

export default configureSocket;
