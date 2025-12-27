# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A survey builder and analytics tool with a React frontend and Express.js backend, structured as an npm workspaces monorepo.

## Commands

```bash
# Development
npm run dev                         # Run both API and web dev servers
npm run api:dev                     # API only (port 3001)
npm run web:dev                     # Web only (port 5173)

# Build
npm run build                       # Build web, then API

# Testing
npm test                            # Run all tests
npm run test --workspace=api        # Backend tests only (Jest)
npm run test --workspace=web        # Frontend tests only (Vitest)
npm run test:watch --workspace=api  # Watch mode for API
npm run test:ui --workspace=web     # Vitest UI mode

# Linting & Formatting
npm run lint                        # Lint both workspaces
npm run format                      # Format both workspaces

# Database
npm run db:push --workspace=api     # Push schema changes
npm run db:migrate --workspace=api  # Run migrations
npm run db:seed --workspace=api     # Seed database

# Docker
npm run docker:up                   # Start containers
npm run docker:down                 # Stop containers
npm run docker:rebuild              # Rebuild and start
```

## Architecture

```
├── api/                    # Express.js backend (CommonJS)
│   ├── src/
│   │   ├── index.ts       # App entry, route mounting
│   │   ├── config/        # Environment, logging, passport
│   │   ├── middleware/    # Auth, CSRF, validation, error handling
│   │   ├── routes/        # REST endpoints (auth, surveys, admin)
│   │   └── services/      # Business logic, Prisma client
│   ├── prisma/
│   │   └── schema.prisma  # Database models
│   └── tests/             # Jest + Supertest tests
│
├── web/                    # React 19 SPA (ESM)
│   ├── src/
│   │   ├── App.tsx        # Root component with React Router
│   │   ├── pages/
│   │   │   ├── admin/     # Dashboard, SurveyBuilder, ResultsPage
│   │   │   └── public/    # LandingPage, SurveyFlow, ContactPage
│   │   ├── components/    # Reusable UI (ProtectedRoute, ui/)
│   │   ├── contexts/      # AuthContext for global auth state
│   │   ├── services/      # API client layer (axios)
│   │   └── tests/         # Vitest + React Testing Library
│   └── vite.config.ts     # Dev server, API proxy to :3001
│
└── docs/                   # Project documentation
```

## Key Data Model

The survey hierarchy: **Survey → Section → Question → Option**

Question types: `SINGLE`, `MULTI`, `LIKERT`, `TEXT`, `LONGTEXT`, `NPS`, `NUMBER`

Branching: Options can trigger actions (show question, skip to section, end survey)

Responses: **Submission → Answer** (anonymous, tracks completion state)

## Technology Stack

**Frontend:** React 19, TypeScript, Vite, React Router, React Hook Form, Zod, TailwindCSS, Chart.js

**Backend:** Express 5, TypeScript, Prisma, PostgreSQL, Passport.js, Pino logging, Zod validation

**Auth:** Session-based (connect-pg-simple) with JWT support for API access

## Development Notes

- API runs on port 3001, web dev server on 5173 with proxy to API
- Database: PostgreSQL 15 (Docker exposes on port 5433)
- Path alias `@/*` maps to `web/src/*`
- Prettier uses 100-char line width with Tailwind class sorting
- ESLint: API uses CommonJS config, web uses ESM config
