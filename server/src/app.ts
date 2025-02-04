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
import { setupBullQueue } from './services/queue';
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
app.get('/health', (_, res) => res.status(200).send('healthy'));

// Error handling
app.use(errorHandler);

// Socket.IO setup
setupSocketIO(io);

// Initialize Bull Queue
setupBullQueue();

// Connect to MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Start server
    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }); 