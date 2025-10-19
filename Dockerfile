# Multi-stage Dockerfile for unified API + Frontend
# This builds both the backend and frontend into a single container

# Stage 1: Build Frontend
FROM node:18-slim AS web-builder

WORKDIR /web

# Copy web dependencies
COPY web/package*.json ./
RUN npm install

# Copy and build web app
COPY web/ ./
RUN npm run build

# Stage 2: Build API
FROM node:18-slim AS api-builder

WORKDIR /api

# Copy API dependencies
COPY api/package*.json ./
RUN npm install

# Copy and build API
COPY api/ ./
RUN npm run build \
  && npx prisma generate

# Stage 3: Production Runtime
FROM node:18-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy API production files
COPY --from=api-builder /api/node_modules ./node_modules
COPY --from=api-builder /api/dist ./dist
COPY --from=api-builder /api/prisma ./prisma
COPY api/package*.json ./

# Copy built frontend static files
COPY --from=web-builder /web/dist ./public

# Expose single port
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production

# Start the unified application
CMD ["npm", "run", "start"]
