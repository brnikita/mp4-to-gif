import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config';
import { logger } from './logger';
import { VideoMetadata } from '../types';

export async function validateVideo(inputPath: string): Promise<VideoMetadata> {
  const metadata = await getVideoMetadata(inputPath);
  
  // Check video dimensions
  if (metadata.width > config.video.maxWidth || metadata.height > config.video.maxHeight) {
    throw new Error(`Video dimensions exceed maximum allowed (${config.video.maxWidth}x${config.video.maxHeight})`);
  }

  // Check video duration
  if (metadata.duration > config.video.maxDuration) {
    throw new Error(`Video duration exceeds maximum allowed (${config.video.maxDuration} seconds)`);
  }

  logger.info('Video validation passed:', metadata);
  return metadata;
}

function getVideoMetadata(inputPath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err: Error | null, metadata: ffmpeg.FfprobeData) => {
      if (err) {
        logger.error('Failed to get video metadata:', err);
        return reject(err);
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        return reject(new Error('No video stream found'));
      }

      resolve({
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        duration: metadata.format.duration || 0,
      });
    });
  });
}