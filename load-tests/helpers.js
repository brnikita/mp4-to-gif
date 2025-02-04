import { check } from 'k6';
import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { CONFIG } from './config.js';

// Load test video as binary
const testVideo = new SharedArray('test video', function () {
  const f = open(CONFIG.TEST_VIDEO_PATH, 'b');
  return [f];
});

export function login() {
  const response = http.post(
    `${CONFIG.API_BASE_URL}${CONFIG.AUTH_ENDPOINT}`,
    JSON.stringify(CONFIG.TEST_USER_CREDENTIALS),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(response, {
    'login successful': (r) => r.status === 200,
    'has auth token': (r) => r.json('token') !== undefined,
  });
  
  return response.json('token');
}

export function uploadVideo(token) {
  const response = http.post(
    `${CONFIG.API_BASE_URL}${CONFIG.UPLOAD_ENDPOINT}`,
    {
      file: http.file(testVideo[0], 'video.mp4', 'video/mp4'),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  check(response, {
    'upload successful': (r) => r.status === 200,
    'has job id': (r) => r.json('jobId') !== undefined,
  });
  
  return response.json('jobId');
}

export function checkConversionStatus(token, jobId) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}${CONFIG.STATUS_ENDPOINT}/${jobId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  check(response, {
    'status check successful': (r) => r.status === 200,
    'has valid status': (r) => ['pending', 'processing', 'completed', 'failed'].includes(r.json('status')),
  });
  
  return response.json('status');
} 