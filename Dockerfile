# Multi-stage Dockerfile for unified API + Frontend
# This builds both the backend and frontend into a single container

# Stage 1: Build Frontend
FROM node:18-slim AS web-builder

WORKDIR /web

# Copy web dependencies
COPY web/package*.json ./
RUN npm install --legacy-peer-deps

# Copy and build web app
COPY web/ ./
# Copy base TypeScript config required by web's tsconfig.json extends
COPY tsconfig.base.json ../tsconfig.base.json
RUN npm run build

# Stage 2: Build API
FROM node:18-slim AS api-builder

WORKDIR /api

# Copy API dependencies
COPY api/package*.json ./
# Install OpenSSL and production + dev dependencies so build tools like TypeScript, Prisma and native bindings are available
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm install --legacy-peer-deps

# Copy base TypeScript config so api/tsconfig.json can extend it
COPY tsconfig.base.json ../tsconfig.base.json

# Copy and build API
COPY api/ ./
# Generate Prisma client before compiling so TypeScript can find Prisma types
RUN npx prisma generate \
  && npm run build \
  && npm prune --omit=dev

# Stage 3: Production Runtime
FROM node:18-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy API production files
COPY --from=api-builder /api/node_modules ./node_modules
COPY --from=api-builder /api/dist ./dist
COPY --from=api-builder /api/prisma ./prisma
COPY api/package*.json ./
COPY api/scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

# Copy built frontend static files
COPY --from=web-builder /web/dist ./public

# Expose single port
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001
ENV PRISMA_HIDE_UPDATE_MESSAGE=1

# Drop root privileges
RUN chown -R node:node /app
USER node

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT||3001) + '/health', res => { if (res.statusCode!==200) process.exit(1); }).on('error', () => process.exit(1));"

# Start: run migrations then start the server
CMD ["./start.sh"]
