# Backend API Service

Express-based API server for MP4 to GIF conversion service.

## Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   ├── auth/        # Authentication service
│   │   ├── queue/       # Bull queue management
│   │   └── storage/     # File storage service
│   ├── utils/           # Helper functions
│   └── app.ts           # Application entry point
├── package.json
└── tsconfig.json
```

## Dependencies

- Express.js
- Bull for job queue
- MongoDB with Mongoose
- Redis for queue and caching
- JWT for authentication
- Socket.io for real-time updates
- Multer for file upload handling

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Conversion
- POST /api/convert - Upload and convert video
- GET /api/convert/:id - Get conversion status
- GET /api/convert/history - Get user's conversion history

## Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mp4-to-gif
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
MAX_FILE_SIZE=10485760  # 10MB
```

## Queue Configuration

The service uses Bull queues for managing conversion tasks:
- `conversion-queue`: Main queue for video processing
- `cleanup-queue`: Periodic cleanup of temporary files

## Error Handling

- Global error handler middleware
- Request validation using express-validator
- Sentry integration for error tracking

## Monitoring

- Basic health check endpoint: GET /health
- Prometheus metrics: GET /metrics
- Bull queue monitoring dashboard (development only) 