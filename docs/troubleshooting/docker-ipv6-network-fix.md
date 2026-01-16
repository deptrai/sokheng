# Docker IPv6 Network Issue Fix

## Problem
Production deployment failing với error:
```
dial tcp [2606:4700:2ff9::1]:443: connect: network is unreachable
```

## Root Cause
- Docker trying to pull `node:18-alpine` image via IPv6
- Production server không có IPv6 connectivity
- Cloudflare R2 registry URL sử dụng IPv6 address

## Solution Applied

### Option 1: Force Platform (Implemented)
Updated `Dockerfile` line 3:
```dockerfile
FROM --platform=linux/amd64 node:18-alpine AS base
```

**Rationale**: Explicitly specifying platform có thể force Docker sử dụng IPv4 registry endpoints.

### Option 2: Alternative Registry (Backup)
Nếu Option 1 không work, có thể thử:

1. **Use Docker Hub mirror**:
```dockerfile
FROM docker.io/library/node:18-alpine AS base
```

2. **Use different base image**:
```dockerfile
FROM node:18-slim AS base  # Debian-based instead of Alpine
```

3. **Pre-pull image on server**:
```bash
# On production server
docker pull node:18-alpine
# Then rebuild
```

## Server-Side Fix (If Needed)

Nếu Dockerfile changes không work, cần fix trên server:

### Disable IPv6 in Docker Daemon
Edit `/etc/docker/daemon.json`:
```json
{
  "ipv6": false,
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### Force IPv4 DNS Resolution
Edit `/etc/hosts` on server:
```
# Force IPv4 for Docker registry
104.18.121.25 registry-1.docker.io
```

## Testing

After applying fix:
1. Commit changes: `git add Dockerfile && git commit -m "fix: force linux/amd64 platform for Docker build"`
2. Push to production branch
3. Trigger redeploy on Dokploy
4. Monitor build logs

## Fallback Plan

Nếu tất cả fails, có thể:
1. Build locally: `docker build -t sokheng-order .`
2. Push to private registry
3. Deploy from private registry

## Status
- ✅ Applied: `--platform=linux/amd64` flag
- ⏳ Testing: Waiting for production redeploy
