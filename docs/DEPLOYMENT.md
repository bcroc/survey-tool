# Deployment Guide

Consolidated, production‑focused guide for deploying, verifying, and operating the Event Survey Application.

## Overview

- Containers: `db` (PostgreSQL), `api` (Node/Express), `web` (nginx static)
- Dev Compose: `docker-compose.yml` (exposes ports for local use)
- Prod Compose: `docker-compose.prod.yml` (proxy/TLS optional, container healthchecks)

## Environment & Secrets

- Copy `.env.example` to `.env` and set secure values.
- Required (examples):
  - `NODE_ENV=production`
  - `PORT=3001`
  - `DATABASE_URL=postgresql://postgres:POSTGRES_PASSWORD@db:5432/event_survey?schema=public`
  - `SESSION_SECRET=<32+ random chars>`
  - `JWT_SECRET=<32+ random chars>` (optional, otherwise falls back to `SESSION_SECRET`)
  - `FRONTEND_URL=https://yourdomain.com`

## Local (Production‑like) Test

- Build and run:
  - `docker compose -f docker-compose.prod.yml up -d --build`
- Status and logs:
  - `docker compose -f docker-compose.prod.yml ps`
  - `docker compose -f docker-compose.prod.yml logs -f`
- Migrations and seed:
  - `docker compose -f docker-compose.prod.yml exec api npm run db:migrate`
  - `docker compose -f docker-compose.prod.yml exec api npm run seed` (optional)

## Production

### Option A: Compose with Proxy (TLS termination)

- Uses `docker-compose.prod.yml` with an `nginx` proxy container.
- Mount valid certs on the host at `/etc/letsencrypt` and map into the proxy service.
- Only the proxy exposes ports `80` and `443` to the host.

Steps:
- Ensure `.env` has all required values.
- Ensure certs exist on the host: `/etc/letsencrypt/live/<domain>/...`
- Start: `docker compose -f docker-compose.prod.yml up -d --build`

### Option B: External LB/Proxy

- Expose only the proxy or put API/Web behind an external load balancer.
- Configure forwarding to `web:80` and `api:3001` on the Docker network.

## Verification

- Containers:
  - `docker compose -f docker-compose.prod.yml ps`
  - `docker compose -f docker-compose.prod.yml logs -f [service]`
- Health endpoints:
  - API liveness: `curl http://localhost:3001/health`
  - API readiness: `curl http://localhost:3001/health/ready`
- Port exposure (prod): Only `80/443` should be open externally.
- Quick external checks (replace host):
  - `curl -I http://yourdomain.com` (301/302 to HTTPS)
  - `curl -I https://yourdomain.com` (200)
  - `curl https://yourdomain.com/health` (contains ok/healthy)

## Security Hardening

- Network
  - Expose only `80/443` via proxy; keep DB and API internal.
  - Recommended firewall (UFW) on VPS: allow `22`, `80`, `443` only.
- TLS
  - Use Let’s Encrypt certs on host; mount read‑only into proxy.
  - Enable HSTS and modern ciphers (see proxy config in `docker/nginx-proxy.conf`).
- App
  - Use strong `SESSION_SECRET`/`JWT_SECRET`.
  - Enforce `NODE_ENV=production`.
  - Keep dependencies updated; run `npm audit` routinely.

## SSL Certificate Management (Let’s Encrypt)

- Certs on host: `/etc/letsencrypt/live/<domain>/`.
- Renewal (host):
  - Stop proxy if needed: `docker compose -f docker-compose.prod.yml stop proxy`
  - Renew: `sudo certbot renew`
  - Start proxy: `docker compose -f docker-compose.prod.yml start proxy`
- Automate with cron or systemd timer.

## Maintenance

- Logs: `docker compose -f docker-compose.prod.yml logs -f [service]`
- Restart one service: `docker compose -f docker-compose.prod.yml restart [service]`
- Rebuild without cache: `docker compose -f docker-compose.prod.yml build --no-cache`
- Database backup (example):
  - `docker compose -f docker-compose.prod.yml exec db pg_dump -U postgres event_survey > backup.sql`

## Troubleshooting

- Ports already in use: ensure no system nginx is binding `80/443`.
- API not reachable:
  - Check API logs
  - Internal curl from web container: `docker compose -f docker-compose.prod.yml exec web curl http://api:3001/health`
- Cert issues: verify file paths and permissions in `/etc/letsencrypt`.

