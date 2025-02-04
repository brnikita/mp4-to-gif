# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY server/ .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Create upload and output directories
RUN mkdir -p uploads output

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "dist/app.js"] 