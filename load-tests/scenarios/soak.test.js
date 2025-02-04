import { sleep } from 'k6';
import { login, uploadVideo, checkConversionStatus } from '../helpers.js';
import { CONFIG } from '../config.js';

export const options = CONFIG.SCENARIOS.soak;

export default function () {
  const token = login();
  const jobId = uploadVideo(token);
  
  // Regular polling in soak test
  let status;
  do {
    sleep(2);
    status = checkConversionStatus(token, jobId);
  } while (status === 'pending' || status === 'processing');
} 