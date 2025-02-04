import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { convertRoutes } from './routes/convert.routes';
import { setupSocketIO } from './services/socket';
import { conversionQueue } from './services/queue/conversion.queue';
import { logger } from './utils/logger';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/convert', convertRoutes);

// Health check
app.get('/health', async (_, res) => {
  const jobCounts = await conversionQueue.getJobCounts();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    queue: {
      active: jobCounts.active,
      waiting: jobCounts.waiting,
      completed: jobCounts.completed,
      failed: jobCounts.failed
    }
  };
  res.status(200).json(health);
});

// Error handling
app.use(errorHandler);

// Socket.IO setup
setupSocketIO(io as any);

// Initialize Bull Queue and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB');
    
    // Start server
    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 