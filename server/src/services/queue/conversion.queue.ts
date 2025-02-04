import Queue from 'bull';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { io } from '../../services/socket';
import { Conversion } from '../../models/conversion.model';

interface ConversionJob {
  videoId: string;
  userId: string;
  inputPath: string;
  outputPath: string;
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
export const addConversionJob = async (conversionId: string, userId: string, inputPath: string, outputPath: string) => {
  const job = await conversionQueue.add({
    videoId: conversionId,
    userId,
    inputPath,
    outputPath
  });
  
  logger.info('Added conversion job to queue', {
    jobId: job.id,
    conversionId,
    userId,
    inputPath,
    outputPath
  });
  
  return job;
};

// Handle progress updates
conversionQueue.on('progress', async (job, progress) => {
  const { videoId, userId } = job.data;
  
  logger.info('Conversion progress update', {
    jobId: job.id,
    conversionId: videoId,
    userId,
    progress
  });

  // Update conversion progress
  await Conversion.findByIdAndUpdate(videoId, {
    progress
  });

  // Notify client about progress
  io.to(userId).emit('conversionStatus', {
    conversionId: videoId,
    status: 'processing',
    progress
  });
});

// Handle completed jobs
conversionQueue.on('completed', async (job, result) => {
  const { videoId, userId } = job.data;
  
  logger.info('Conversion job completed', {
    jobId: job.id,
    conversionId: videoId,
    userId,
    result
  });

  // Update conversion status to completed
  await Conversion.findByIdAndUpdate(videoId, {
    status: 'completed',
    progress: 100
  });

  // Notify client about completion
  io.to(userId).emit('conversionStatus', {
    conversionId: videoId,
    status: 'completed'
  });
});

// Handle failed jobs
conversionQueue.on('failed', async (job, error) => {
  const { videoId, userId } = job.data;
  
  logger.error('Conversion job failed', {
    jobId: job.id,
    conversionId: videoId,
    userId,
    error: error instanceof Error ? error.message : 'Unknown error'
  });

  // Update conversion status to failed
  await Conversion.findByIdAndUpdate(videoId, {
    status: 'failed',
    error: error instanceof Error ? error.message : 'Unknown error'
  });

  // Notify client about failure
  io.to(userId).emit('conversionStatus', {
    conversionId: videoId,
    status: 'failed',
    error: error instanceof Error ? error.message : 'Unknown error'
  });
});

export { conversionQueue }; 