import ffmpeg from 'fluent-ffmpeg';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { ConvertOptions } from '../../types';

export async function convertVideo({ inputPath, outputPath, onProgress }: ConvertOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=-1:${config.video.outputHeight}`,
        `-r ${config.video.outputFps}`,
        '-f gif'
      ])
      .output(outputPath);

    // Add progress handler if provided
    if (onProgress) {
      command.on('progress', (progress: { percent?: number }) => {
        const percent = Math.min(100, Math.round(progress.percent || 0));
        onProgress(percent);
      });
    }

    // Add event handlers
    command
      .on('end', () => {
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