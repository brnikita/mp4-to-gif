import { sleep } from 'k6';
import { login, uploadVideo, checkConversionStatus } from '../helpers.js';
import { CONFIG } from '../config.js';

export const options = CONFIG.SCENARIOS.load;

export default function () {
  const token = login();
  const jobId = uploadVideo(token);
  
  // Poll status less frequently in load test
  let status;
  do {
    sleep(3);
    status = checkConversionStatus(token, jobId);
  } while (status === 'pending' || status === 'processing');
} 