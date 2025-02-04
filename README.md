# MP4 to GIF Conversion Service

A scalable, multi-user web service for converting MP4 videos to GIF format using Angular, Express, and Docker Swarm.

## Project Structure

```
mp4_code_challenge/
├── client/                 # Angular frontend application
├── server/                 # Express backend API
├── worker/                # Worker service for video processing
├── load-tests/            # Load testing scripts
├── docker/                # Docker and Docker Swarm configurations
└── docs/                  # Additional documentation
```

## Key Features

- High-load processing up to 1000 convert requests per minute
- Multi-user support
- Self-recovery and fault tolerance
- Docker Swarm deployment ready
- Scalable worker architecture (up to 5 replicas)

## Technical Requirements

- Node.js 18.x or higher
- Docker and Docker Swarm
- Redis for job queue management
- MongoDB for user and job state management
- FFmpeg for video processing

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd client && npm install
   
   # Install backend dependencies
   cd ../server && npm install
   
   # Install worker dependencies
   cd ../worker && npm install
   ```

3. Start development environment:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:4200
   - API: http://localhost:3000

## Production Deployment

1. Build Docker images:
   ```bash
   docker-compose -f docker/docker-compose.prod.yml build
   ```

2. Initialize Docker Swarm:
   ```bash
   docker swarm init
   ```

3. Deploy the stack:
   ```bash
   docker stack deploy -c docker/docker-compose.prod.yml mp4-to-gif
   ```

## Architecture Overview

- **Frontend**: Angular application handling user interactions and file uploads
- **Backend API**: Express server managing request validation and job coordination
- **Worker Service**: Dedicated service for MP4 to GIF conversion using FFmpeg
- **Job Queue**: Bull queue backed by Redis for reliable job processing
- **Database**: MongoDB for storing user data and job metadata

## Performance Characteristics

- Maximum input video size: 1024x768px
- Maximum video length: 10 seconds
- Output GIF size: height=400px (width scaled proportionally)
- Output FPS: 5
- Processing time: 5 seconds to 5 minutes
- API capacity: 1000 requests per minute

## Monitoring and Logging

- Sentry for error tracking
- Basic metrics exposed for Prometheus
- Docker Swarm service logs

## Contributing

Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.