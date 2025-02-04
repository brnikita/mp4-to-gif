# Load Testing Suite

This directory contains load tests for the MP4 to GIF conversion service using Artillery.io.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a sample MP4 file for testing:
Create a directory named `samples` and place a sample MP4 file named `sample.mp4` in it.

3. Set up environment variables:
```bash
export TEST_USER_EMAIL=your-test-user@example.com
export TEST_USER_PASSWORD=your-test-password
```

## Running Tests

### Basic Test Run
```bash
npm test
```

### Generate HTML Report
```bash
npm run test:output
npm run report
```

## Test Scenarios

The load tests simulate the following user flow:
1. User authentication
2. MP4 file upload
3. WebSocket connection for real-time updates
4. Monitoring conversion progress
5. Verifying conversion result

## Load Profile

The test runs in three phases:
1. Warm-up: 5 users/second for 1 minute
2. Ramp-up: 10-20 users/second over 2 minutes
3. Sustained load: 20 users/second for 5 minutes

## Metrics Collected

- Response times for API endpoints
- WebSocket connection success rate
- Conversion success rate
- Error rates
- Socket connection stability

## Notes

- The tests assume the application is running locally on default ports
- Adjust the `maxWaitTime` in `functions.js` if your conversions typically take longer
- Monitor server resources during load testing to identify bottlenecks 