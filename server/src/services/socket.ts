import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { AuthService } from './auth/auth.service';
import { logger } from '../utils/logger';

let io: SocketServer;

export const setupSocketIO = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error('Authentication required');
      }

      const decoded = await AuthService.validateToken(token);
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    
    logger.info('Client connected', { userId, socketId: socket.id });

    // Join user's room for private messages
    socket.join(userId);

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info('Client disconnected', { userId, socketId: socket.id });
    });

    // Handle conversion progress updates
    socket.on('conversionProgress', (data: { conversionId: string; progress: number }) => {
      logger.debug('Conversion progress update', {
        userId,
        conversionId: data.conversionId,
        progress: data.progress
      });
    });
  });

  return io;
};

export { io }; 