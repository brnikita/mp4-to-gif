import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config';
import { logger } from './logger';
import { VideoMetadata } from '../types';

/**
 * Validates an input video file against configured constraints
 * 
 * @param {string} inputPath - The filesystem path to the input video file
 * @returns {Promise<VideoMetadata>} Metadata about the validated video
 * @throws {Error} If video dimensions exceed maximum allowed size
 * @throws {Error} If video duration exceeds maximum allowed length
 * @throws {Error} If video metadata cannot be read
 */
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

/**
 * Extracts metadata from a video file using FFprobe
 * 
 * @param {string} inputPath - The filesystem path to the input video file
 * @returns {Promise<VideoMetadata>} Object containing video width, height and duration
 * @throws {Error} If FFprobe fails to read the video file
 * @private
 */
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