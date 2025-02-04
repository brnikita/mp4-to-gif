import { Job } from 'bull';
import { convertVideo } from '../converter';
import { logger } from '../../utils/logger';
import { validateVideo } from '../../utils/validator';
import { cleanup } from '../storage';

interface ConversionJob {
  videoId: string;
  userId: string;
  inputPath: string;
  outputPath: string;
}

export async function processConversionJob(job: Job<ConversionJob>) {
  const { videoId, userId, inputPath, outputPath } = job.data;
  
  try {
    logger.info(`Starting conversion for video ${videoId} (User: ${userId})`);

    // Validate input video
    await validateVideo(inputPath);

    // Convert video to GIF
    await convertVideo({
      inputPath,
      outputPath,
      onProgress: (progress) => {
        job.progress(progress);
      },
    });

    logger.info(`Conversion completed for video ${videoId}`);
    
    return {
      success: true,
      outputPath,
    };
  } catch (error) {
    logger.error(`Conversion failed for video ${videoId}:`, error);
    throw error;
  } finally {
    // Clean up temporary files
    await cleanup(inputPath);
  }
} 