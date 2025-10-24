Event Survey Application

Full‑stack survey app for creating, running, and analyzing event feedback. Built with React + TypeScript (web) and Node.js + Express + Prisma (api) backed by PostgreSQL.

## Quick Start

- Requirements: Node.js 18+ and npm 9+, or Docker + Docker Compose

- Install dependencies (monorepo workspaces):
  - `npm install`

- Run in development (api + web):
  - `npm run dev`

- Build both packages:
  - `npm run build`

- Test both packages:
  - `npm test`

### Docker

- Local dev stack:
  - `docker compose up -d` (or `docker-compose up -d`)
  - API at `http://localhost:3001`, Web at `http://localhost:8080`

- Production-like stack:
  - `docker compose -f docker-compose.prod.yml up -d --build`

See `docs/DEPLOYMENT.md` for production guidance, TLS, and verification.

## Useful Commands

- API workspace: `npm run dev --workspace=api`, `npm run db:push --workspace=api`, `npm run test --workspace=api`
- Web workspace: `npm run dev --workspace=web`, `npm run build --workspace=web`, `npm run test --workspace=web`

## Documentation

- Start: `docs/INDEX.md`
- Key docs: `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`, `docs/API.md`, `docs/DEVELOPMENT.md`, `docs/USER_GUIDE.md`

## License

See `LICENSE`.

