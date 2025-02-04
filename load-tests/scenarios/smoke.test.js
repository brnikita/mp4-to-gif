import { sleep } from 'k6';
import { login, uploadVideo, checkConversionStatus } from '../helpers.js';
import { CONFIG } from '../config.js';

export const options = CONFIG.SCENARIOS.smoke;

export default function () {
  // Login
  const token = login();
  
  // Upload video
  const jobId = uploadVideo(token);
  
  // Check conversion status until complete or failed
  let status;
  do {
    sleep(1);
    status = checkConversionStatus(token, jobId);
  } while (status === 'pending' || status === 'processing');
  
  // Verify final status
  if (status === 'failed') {
    console.error(`Job ${jobId} failed`);
  }
} 