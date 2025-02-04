# Worker Service

Worker service for processing MP4 to GIF conversion tasks.

## Structure

```
worker/
├── src/
│   ├── config/           # Configuration files
│   ├── services/         # Core services
│   │   ├── converter/    # FFmpeg conversion logic
│   │   ├── queue/        # Queue processors
│   │   └── storage/      # File handling
│   ├── utils/           # Helper functions
│   └── worker.ts        # Worker entry point
├── package.json
└── tsconfig.json
```

## Dependencies

- FFmpeg for video processing
- Bull for job queue processing
- Sharp for image processing
- Redis for queue management
- MongoDB for job status updates

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install FFmpeg:
   ```bash
   # For Ubuntu/Debian
   apt-get install ffmpeg

   # For Windows (using chocolatey)
   choco install ffmpeg
   ```

3. Start worker:
   ```bash
   npm run dev
   ```

## Conversion Process

1. Receive job from queue
2. Download/access source video
3. Validate video parameters
4. Convert to GIF using FFmpeg
5. Optimize GIF size
6. Upload result
7. Clean up temporary files

## Configuration

### Environment Variables
```env
NODE_ENV=development
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb://localhost:27017/mp4-to-gif
STORAGE_PATH=./storage
MAX_CONCURRENT_JOBS=3
```

### FFmpeg Settings
- Input validation: 1024x768px max, 10s length
- Output settings: height=400px, 5 FPS
- Optimization flags for quality/size balance

## Error Handling

- Automatic job retry on failure
- Dead letter queue for failed jobs
- Error reporting to Sentry
- Cleanup of incomplete conversions

## Monitoring

- Job processing metrics
- Resource usage monitoring
- Health check endpoint
- Queue status monitoring 