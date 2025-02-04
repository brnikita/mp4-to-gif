interface Config {
  mongodb: {
    uri: string;
  };
  redis: {
    url: string;
  };
  worker: {
    maxConcurrentJobs: number;
    storagePath: string;
  };
  video: {
    maxWidth: number;
    maxHeight: number;
    maxDuration: number;
    outputHeight: number;
    outputFps: number;
  };
}

export const config: Config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mp4-to-gif',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  worker: {
    maxConcurrentJobs: Number(process.env.MAX_CONCURRENT_JOBS) || 3,
    storagePath: process.env.STORAGE_PATH || './storage',
  },
  video: {
    maxWidth: 1024,
    maxHeight: 768,
    maxDuration: 10, // seconds
    outputHeight: 400,
    outputFps: 5,
  },
}; 