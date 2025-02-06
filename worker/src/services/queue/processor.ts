import { Job } from 'bull';
import { convertVideo } from '../converter';
import { logger } from '../../utils/logger';
import { validateVideo } from '../../utils/validator';
import { cleanup } from '../storage';
import { connect as connectDB } from 'mongoose';
import { config } from '../../config';
import { Conversion } from '../../models/conversion.model';
import fs from 'fs/promises';
import path from 'path';

interface ConversionJob {
  videoId: string;
  userId: string;
  inputPath: string;
  outputPath: string;
}

export async function processConversionJob(job: Job<ConversionJob>) {
  const { videoId, userId, inputPath, outputPath } = job.data;
  
  // Convert relative paths to absolute paths
  const absoluteInputPath = path.join(process.env.UPLOAD_DIR || '/app/uploads', path.basename(inputPath));
  const absoluteOutputPath = path.join(process.env.OUTPUT_DIR || '/app/output', path.basename(outputPath));
  
  try {
    logger.info(`Starting conversion for video ${videoId} (User: ${userId})`);
    logger.info(`Input path: ${absoluteInputPath}`);
    logger.info(`Output path: ${absoluteOutputPath}`);

    // Update status to processing
    await Conversion.findByIdAndUpdate(videoId, {
      status: 'processing',
      progress: 0,
      error: null // Clear any previous errors
    }, { new: true });

    // Ensure input file exists
    try {
      await fs.access(absoluteInputPath);
    } catch (err) {
      throw new Error(`Input file not found at ${absoluteInputPath}`);
    }

    // Get file size
    const stats = await fs.stat(absoluteInputPath);
    const fileSize = stats.size;

    try {
      // Validate input video and get metadata
      const metadata = await validateVideo(absoluteInputPath);
      logger.info(`Video metadata:`, metadata);

      // Update video metadata
      await Conversion.findByIdAndUpdate(videoId, {
        metadata: {
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height,
          size: fileSize
        }
      }, { new: true });

      // Ensure output directory exists
      await fs.mkdir(path.dirname(absoluteOutputPath), { recursive: true });

      // Convert video to GIF
      logger.info(`Starting conversion to GIF: ${absoluteInputPath} -> ${absoluteOutputPath}`);
      await convertVideo({
        inputPath: absoluteInputPath,
        outputPath: absoluteOutputPath,
        onProgress: async (progress) => {
          logger.info(`Conversion progress: ${progress}%`);
          await job.progress(progress);
          await Conversion.findByIdAndUpdate(videoId, {
            progress: Math.round(progress)
          }, { new: true });
        },
      });

      // Mark as completed
      await Conversion.findByIdAndUpdate(videoId, {
        status: 'completed',
        progress: 100,
        outputPath
      }, { new: true });

      logger.info(`Conversion completed for video ${videoId}`);
      
      // Clean up input file only after successful conversion
      await cleanup(absoluteInputPath);
      
      return {
        success: true,
        outputPath,
        metadata
      };
    } catch (error) {
      // For validation errors, we want to fail immediately without retrying
      if (error instanceof Error && error.message.includes('exceeds maximum allowed')) {
        await Conversion.findByIdAndUpdate(videoId, {
          status: 'failed',
          error: error.message
        }, { new: true });
        
        // Clean up the file for validation errors
        await cleanup(absoluteInputPath);
        
        // Prevent retries for validation errors
        job.discard();
        throw error;
      }
      
      // For other errors, let Bull handle retries
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(`Conversion failed for video ${videoId}:`, error);
    
    // Update status to failed
    await Conversion.findByIdAndUpdate(videoId, {
      status: 'failed',
      error: errorMessage
    }, { new: true });
    
    throw error;
  }
} 