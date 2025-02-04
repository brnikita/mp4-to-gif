# Docker Configuration

Docker and Docker Swarm configuration for the MP4 to GIF conversion service.

## Structure

```
docker/
├── client/              # Frontend Dockerfile and configs
├── server/              # Backend API Dockerfile and configs
├── worker/             # Worker service Dockerfile and configs
├── nginx/              # Nginx reverse proxy configuration
├── docker-compose.yml          # Development compose file
├── docker-compose.prod.yml     # Production compose file
└── docker-stack.yml           # Docker Swarm stack file
```

## Services

- **Frontend**: Angular application (1 replica)
- **Backend API**: Express server (1 replica)
- **Worker**: Conversion service (up to 5 replicas)
- **Redis**: Queue and caching
- **MongoDB**: Database
- **Nginx**: Reverse proxy and load balancer

## Development Setup

1. Start development environment:
   ```bash
   docker-compose up
   ```

2. Access services:
   - Frontend: http://localhost:4200
   - API: http://localhost:3000
   - MongoDB: localhost:27017
   - Redis: localhost:6379

## Production Deployment

1. Build images:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Initialize Swarm:
   ```bash
   docker swarm init
   ```

3. Deploy stack:
   ```bash
   docker stack deploy -c docker-stack.yml mp4-to-gif
   ```

## Service Scaling

- API Server: Fixed at 1 replica
- Workers: Auto-scales up to 5 replicas based on queue length
- Frontend: Single replica (stateless)

## Volume Configuration

- MongoDB data persistence
- Redis persistence
- Shared storage for video/GIF files

## Network Configuration

- Frontend network (public)
- Backend network (private)
- Database network (private)

## Resource Limits

```yaml
services:
  worker:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
```

## Health Checks

All services include health checks for Docker Swarm orchestration:
- Frontend: HTTP check on /
- Backend: HTTP check on /health
- Worker: Custom health check script
- Redis & MongoDB: Standard health checks

## Logging

- JSON log format
- Log rotation
- Centralized logging setup
- Sentry integration 