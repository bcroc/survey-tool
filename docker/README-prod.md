Production Docker helper files

Files added:
- Dockerfile.api - multi-stage build for the API
- Dockerfile.web - build frontend and serve via nginx
- nginx.conf - nginx configuration used by Dockerfile.web
- ../docker-compose.prod.yml - production compose file to build and run the stack

Quick start (local testing):

1. Copy `.env.example` to `.env` and fill in production values.
2. Build and run:

   docker compose -f docker-compose.prod.yml up --build -d

3. Check logs:

   docker compose -f docker-compose.prod.yml logs -f

Notes:
- In a real production deployment prefer building images in CI and pushing to a registry, then using the images (not building on the host).
- Use a reverse proxy (Traefik, AWS ALB, or NGINX) with TLS termination in front of the `web` service.
- Keep secrets in a secret store (e.g., Docker secrets, AWS Parameter Store, or Kubernetes secrets) rather than plaintext `.env` files.
