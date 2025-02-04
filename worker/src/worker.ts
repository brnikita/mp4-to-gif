import { connect as connectDB } from 'mongoose';
import Bull from 'bull';
import { config } from './config';
import { processConversionJob } from './services/queue/processor';
import { logger } from './utils/logger';
import { ConversionJob } from './types';

async function startWorker() {
  try {
    // Connect to MongoDB
    await connectDB(config.mongodb.uri);
    logger.info('Connected to MongoDB');

    // Initialize conversion queue
    const conversionQueue = new Bull<ConversionJob>('video-conversion', config.redis.url);
    
    // Process jobs
    conversionQueue.process(config.worker.maxConcurrentJobs, processConversionJob);

    // Queue event handlers
    conversionQueue.on('completed', (job: Bull.Job<ConversionJob>) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    conversionQueue.on('failed', (job: Bull.Job<ConversionJob>, err: Error) => {
      logger.error(`Job ${job?.id} failed:`, err);
    });

    conversionQueue.on('error', (err: Error) => {
      logger.error('Queue error:', err);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      await conversionQueue.close();
      process.exit(0);
    });

    logger.info('Worker service started successfully');
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker(); 