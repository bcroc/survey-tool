# Deployment Guide

Complete guide for deploying the Event Survey Application to production.

## Deployment Options

1. **Docker Compose** (Recommended for simplicity)
2. **Kubernetes** (For scale and high availability)
3. **Cloud Platforms** (AWS, GCP, Azure, DigitalOcean)
4. **Platform-as-a-Service** (Heroku, Railway, Render)

---

## Docker Compose Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Server with at least 2GB RAM
- Domain name (optional, for HTTPS)

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clone Repository

```bash
git clone <your-repo-url>
cd survey-tool
```

### 3. Configure Environment

```bash
# Create production environment file
cp api/.env.example api/.env
nano api/.env
```

**Production Environment Variables:**
```env
NODE_ENV=production
PORT=3001

# Generate secure secret: openssl rand -base64 32
SESSION_SECRET=your-very-secure-random-secret-key

# Database configuration
DATABASE_URL=postgresql://postgres:your-secure-password@db:5432/event_survey?schema=public

# Frontend URL (your domain)
FRONTEND_URL=https://yourdomain.com

# Admin credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-password-change-after-first-login

# Optional
DEFAULT_EVENT_SLUG=your-event-slug
```

**Update docker-compose.yml:**
```yaml
services:
  db:
    environment:
      - POSTGRES_PASSWORD=your-secure-password  # Match DATABASE_URL
```

### 4. Build and Deploy

```bash
# Build and start containers
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Wait for containers to be healthy
docker-compose logs app | grep "Server running"
```

### 5. Initialize Database

```bash
# Push database schema
docker-compose exec app npm run db:push

# Seed demo data (optional)
docker-compose exec app npm run seed
```

### 6. Setup HTTPS with Nginx

**Install Nginx and Certbot:**
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

**Create Nginx Configuration** (`/etc/nginx/sites-available/survey`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload size if needed
    client_max_body_size 10M;
}
```

**Enable Configuration:**
```bash
sudo ln -s /etc/nginx/sites-available/survey /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Setup SSL Certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure HTTPS and set up auto-renewal.

### 7. Enable Production Security

Update `api/src/index.ts` to ensure production settings:
```typescript
cookie: {
  secure: true,           // HTTPS only
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000
}
```

Rebuild:
```bash
docker-compose down
docker-compose up -d --build
```

### 8. Setup Monitoring (Optional)

**Install monitoring tools:**
```bash
# System monitoring
sudo apt install htop

# Log monitoring
docker-compose logs -f --tail=100 app
```

**Setup Log Rotation:**
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/docker-containers

# Add:
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
```

### 9. Backup Strategy

**Database Backup Script** (`backup.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T db pg_dump -U postgres event_survey > "$BACKUP_DIR/db_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql"
```

**Setup Cron:**
```bash
chmod +x backup.sh
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

---

## Cloud Platform Deployment

### AWS Deployment

#### Using ECS (Elastic Container Service)

1. **Push Image to ECR:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t survey-app .
docker tag survey-app:latest <account>.dkr.ecr.us-east-1.amazonaws.com/survey-app:latest

# Push
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/survey-app:latest
```

2. **Setup RDS PostgreSQL:**
- Create RDS PostgreSQL instance
- Note connection details
- Update DATABASE_URL

3. **Create ECS Task Definition:**
```json
{
  "family": "survey-app",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "<ecr-image-url>",
      "portMappings": [{"containerPort": 3001}],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3001"}
      ],
      "secrets": [
        {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "SESSION_SECRET", "valueFrom": "arn:aws:secretsmanager:..."}
      ]
    }
  ]
}
```

4. **Create Load Balancer:**
- Application Load Balancer
- HTTPS listener with ACM certificate
- Target group pointing to ECS service

### Google Cloud Platform

#### Using Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/survey-app

# Deploy
gcloud run deploy survey-app \
  --image gcr.io/PROJECT_ID/survey-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=db-url:latest,SESSION_SECRET=session-secret:latest
```

Setup Cloud SQL PostgreSQL and connect via Cloud SQL Proxy.

### DigitalOcean

#### Using App Platform

1. Connect GitHub repository
2. Configure build settings:
   - Dockerfile: `Dockerfile`
   - Build command: Auto-detected
3. Add PostgreSQL database addon
4. Configure environment variables
5. Deploy

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Session encryption key | `random-32-byte-string` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Default admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | Default admin password | `admin123` |
| `DEFAULT_EVENT_SLUG` | Default event identifier | `fall-summit-2025` |

---

## Health Checks

### Application Health Endpoint

```bash
curl http://localhost:3001/health
# Response: {"status":"ok","timestamp":"2025-10-19T03:45:00.000Z"}
```

### Database Health Check

```bash
docker-compose exec db pg_isready -U postgres
# Response: /var/run/postgresql:5432 - accepting connections
```

---

## Performance Optimization

### 1. Enable Compression

Update `api/src/index.ts`:
```typescript
import compression from 'compression';
app.use(compression());
```

### 2. Static Asset Caching

Nginx configuration:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Database Connection Pool

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

### 4. CDN (Optional)

Use CloudFlare or AWS CloudFront to cache static assets.

---

## Monitoring & Maintenance

### Log Management

```bash
# View recent logs
docker-compose logs -f --tail=100 app

# Export logs
docker-compose logs app > app.log
```

### Database Maintenance

```bash
# Vacuum database (monthly)
docker-compose exec db psql -U postgres event_survey -c "VACUUM ANALYZE;"

# Check database size
docker-compose exec db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('event_survey'));"
```

### Update Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations if needed
docker-compose exec app npm run db:push
```

---

## Scaling

### Horizontal Scaling

Run multiple app containers behind a load balancer:

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
    # ... rest of config
```

### Vertical Scaling

Increase container resources:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check container status
docker-compose ps

# Restart containers
docker-compose restart
```

### Database Connection Issues

```bash
# Verify database is running
docker-compose exec db pg_isready

# Check connection from app
docker-compose exec app node -e "console.log(process.env.DATABASE_URL)"

# Test connection
docker-compose exec db psql -U postgres -d event_survey -c "SELECT 1;"
```

### High Memory Usage

```bash
# Check memory
docker stats

# Restart containers
docker-compose restart

# Clear Docker cache
docker system prune -a
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong SESSION_SECRET
- [ ] Enable HTTPS with valid certificate
- [ ] Configure firewall (only 80, 443, 22)
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Docker containers run as non-root

---

## Rollback Procedure

```bash
# View previous builds
docker images

# Rollback to previous version
docker-compose down
git checkout <previous-commit>
docker-compose up -d --build

# Or use specific image tag
docker tag survey-app:backup survey-app:latest
docker-compose up -d
```
