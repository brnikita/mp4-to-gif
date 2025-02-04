import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: '24h'
  },
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mp4-to-gif'
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedTypes: ['video/mp4'],
    maxDuration: 10, // seconds
    maxWidth: 1024,
    maxHeight: 768
  },
  
  output: {
    height: 400,
    fps: 5,
    maxProcessingTime: 300 // 5 minutes in seconds
  },
  
  queue: {
    name: 'conversion-queue',
    concurrency: parseInt(process.env.MAX_CONCURRENT_JOBS || '3', 10),
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
} as const; 