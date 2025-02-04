import Queue from 'bull';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { Conversion } from '../../models/conversion.model';
import { io } from '../../services/socket';

interface ConversionJob {
  conversionId: string;
  userId: string;
}

const conversionQueue = new Queue<ConversionJob>(config.queue.name, config.redis.url, {
  defaultJobOptions: {
    attempts: config.queue.attempts,
    backoff: config.queue.backoff,
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Add job to queue
export const addConversionJob = async (conversionId: string, userId: string) => {
  const job = await conversionQueue.add({
    conversionId,
    userId
  });
  
  logger.info('Added conversion job to queue', {
    jobId: job.id,
    conversionId,
    userId
  });
  
  return job;
};

// Process jobs
conversionQueue.process(config.queue.concurrency, async (job) => {
  const { conversionId, userId } = job.data;
  
  try {
    logger.info('Processing conversion job', {
      jobId: job.id,
      conversionId,
      userId
    });

    // Update conversion status to processing
    await Conversion.findByIdAndUpdate(conversionId, {
      status: 'processing',
      progress: 0
    });

    // Notify client about status change
    io.to(userId).emit('conversionStatus', {
      conversionId,
      status: 'processing',
      progress: 0
    });

    // The actual conversion will be handled by the worker service
    // This queue is just for job management and status updates

  } catch (error) {
    logger.error('Error processing conversion job', {
      jobId: job.id,
      conversionId,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Update conversion status to failed
    await Conversion.findByIdAndUpdate(conversionId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Notify client about failure
    io.to(userId).emit('conversionStatus', {
      conversionId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
});

// Handle completed jobs
conversionQueue.on('completed', async (job) => {
  const { conversionId, userId } = job.data;
  
  logger.info('Conversion job completed', {
    jobId: job.id,
    conversionId,
    userId
  });
});

// Handle failed jobs
conversionQueue.on('failed', async (job, error) => {
  const { conversionId, userId } = job.data;
  
  logger.error('Conversion job failed', {
    jobId: job.id,
    conversionId,
    userId,
    error: error instanceof Error ? error.message : 'Unknown error'
  });
});

export { conversionQueue }; 