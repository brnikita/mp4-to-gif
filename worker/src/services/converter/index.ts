import ffmpeg from 'fluent-ffmpeg';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { ConvertOptions } from '../../types';

export async function convertVideo({ inputPath, outputPath, onProgress }: ConvertOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    let lastProgress = 0;
    
    const command = ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=-1:${config.video.outputHeight}`,
        `-r ${config.video.outputFps}`,
        '-f gif'
      ])
      .output(outputPath);

    // Add progress handler if provided
    if (onProgress) {
      command.on('progress', (progress: { percent?: number; frames?: number; currentFps?: number }) => {
        const percent = Math.min(100, Math.round(progress.percent || 0));
        
        // Only trigger if progress has changed
        if (percent > lastProgress) {
          lastProgress = percent;
          logger.info('FFmpeg progress:', {
            percent,
            frames: progress.frames,
            fps: progress.currentFps
          });
          onProgress(percent);
        }
      });
    }

    // Add event handlers
    command
      .on('start', (commandLine) => {
        logger.info('FFmpeg started with command:', commandLine);
      })
      .on('end', () => {
        // Ensure we hit 100% at the end
        if (onProgress && lastProgress < 100) {
          onProgress(100);
        }
        logger.info('FFmpeg conversion completed');
        resolve();
      })
      .on('error', (err: Error) => {
        logger.error('FFmpeg conversion failed:', err);
        reject(err);
      });

    // Start the conversion
    command.run();
  });
} 