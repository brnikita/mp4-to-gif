# Load Testing

Load testing scripts and documentation for the MP4 to GIF conversion service.

## Structure

```
load-tests/
├── scripts/
│   ├── curl/             # CURL-based test scripts
│   │   ├── convert.sh    # Video conversion test
│   │   └── auth.sh       # Authentication test
│   └── k6/              # K6 performance tests
├── data/                # Test video files
└── results/             # Test results and reports
```

## CURL Tests

Basic load testing using CURL commands:

```bash
#!/bin/bash
# convert.sh - Basic conversion test

# Authentication
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# Conversion request
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/convert \
    -H "Authorization: Bearer $TOKEN" \
    -F "video=@../data/sample.mp4" \
    -w "%{http_code} - %{time_total}s\n"
done
```

## Performance Requirements

- Handle 1000 requests per minute
- Response time under 5 minutes
- Success rate > 99%

## Test Scenarios

1. Single user, sequential requests
2. Multiple users, concurrent requests
3. Burst traffic (sudden spike in requests)
4. Long-running load test (1 hour)
5. Error handling test (invalid files)

## Monitoring During Tests

- CPU usage
- Memory consumption
- Queue length
- Network I/O
- Storage I/O
- Error rates

## Test Data

Sample video files with various characteristics:
- Different resolutions
- Different lengths
- Different formats
- Edge cases

## Running Tests

1. Start services:
   ```bash
   docker-compose up -d
   ```

2. Run basic CURL test:
   ```bash
   cd scripts/curl
   ./convert.sh
   ```

3. Run K6 test:
   ```bash
   k6 run scripts/k6/load-test.js
   ```

## Results Analysis

Test results should include:
- Request success rate
- Response time distribution
- Error distribution
- Resource utilization
- Queue statistics

## Acceptance Criteria

- [ ] Handles 1000 requests per minute
- [ ] Response time within 5 minutes
- [ ] No service crashes
- [ ] Resource usage within limits
- [ ] Error rate below 1% 