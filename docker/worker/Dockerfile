# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY worker/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY worker/ .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-alpine

# Install FFmpeg and other required tools
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files
COPY worker/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Create storage directory for temporary files
RUN mkdir -p storage

# Start the worker
CMD ["node", "dist/worker.js"] 