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
    maxWidth: 1920,
    maxHeight: 1080,
    maxDuration: 60, // seconds
    outputHeight: 400,
    outputFps: 10,
  },
}; 