import { sleep } from 'k6';
import { login, uploadVideo, checkConversionStatus } from '../helpers.js';
import { CONFIG } from '../config.js';

export const options = CONFIG.SCENARIOS.stress;

export default function () {
  const token = login();
  const jobId = uploadVideo(token);
  
  // Minimal status checking in stress test
  let status;
  do {
    sleep(5);
    status = checkConversionStatus(token, jobId);
  } while (status === 'pending' || status === 'processing');
} 