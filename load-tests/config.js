export const CONFIG = {
  // API endpoints
  API_BASE_URL: 'http://localhost:3000',
  
  // Test video details
  TEST_VIDEO_PATH: './test-assets/sample.mp4',
  
  // Authentication
  AUTH_ENDPOINT: '/api/auth/login',
  TEST_USER_CREDENTIALS: {
    email: 'test@example.com',
    password: 'test123'
  },
  
  // Conversion endpoints
  UPLOAD_ENDPOINT: '/api/convert/upload',
  STATUS_ENDPOINT: '/api/convert/status',
  
  // Test scenarios
  SCENARIOS: {
    smoke: {
      vus: 1,
      duration: '1m'
    },
    load: {
      vus: 50,
      duration: '5m'
    },
    stress: {
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '1m', target: 0 }
      ]
    },
    soak: {
      vus: 30,
      duration: '30m'
    }
  }
}; 