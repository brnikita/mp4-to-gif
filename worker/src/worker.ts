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
    const conversionQueue = new Bull<ConversionJob>('conversion-queue', config.redis.url);
    
    // Process jobs
    conversionQueue.process(config.worker.maxConcurrentJobs, processConversionJob);

    // Queue event handlers
    conversionQueue.on('completed', (job: Bull.Job<ConversionJob>) => {
      logger.info(`Job ${job.id} completed successfully`, {
        jobId: job.id,
        userId: job.data.userId,
        videoId: job.data.videoId,
        inputPath: job.data.inputPath,
        outputPath: job.data.outputPath,
        duration: Date.now() - job.timestamp
      });
    });

    conversionQueue.on('failed', (job: Bull.Job<ConversionJob>, err: Error) => {
      logger.error(`Job ${job?.id} failed:`, {
        jobId: job?.id,
        userId: job?.data?.userId,
        videoId: job?.data?.videoId,
        error: err.message,
        stack: err.stack
      });
    });

    conversionQueue.on('error', (err: Error) => {
      logger.error('Queue error:', {
        error: err.message,
        stack: err.stack
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM signal, shutting down gracefully...');
      await conversionQueue.close();
      process.exit(0);
    });

    logger.info('Worker service started successfully', {
      environment: process.env.NODE_ENV,
      maxConcurrentJobs: config.worker.maxConcurrentJobs,
      nodeVersion: process.version
    });
  } catch (error) {
    logger.error('Failed to start worker:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

startWorker(); 