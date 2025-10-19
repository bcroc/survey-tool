# Architecture Overview

## System Design

The Event Survey Application follows a modern, containerized full-stack architecture with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                     (React SPA)                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS
                      │ REST API
┌─────────────────────▼───────────────────────────────────────┐
│                    Docker Container                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Node.js Express Server                        │   │
│  │  ┌───────────────┐  ┌──────────────┐                 │   │
│  │  │  API Routes   │  │  Static      │                 │   │
│  │  │  (/api/*)     │  │  Frontend    │                 │   │
│  │  └───────┬───────┘  │  (/)         │                 │   │
│  │          │          └──────────────┘                 │   │
│  │  ┌───────▼──────────────────────────────┐           │   │
│  │  │  Middleware Layer                     │           │   │
│  │  │  • Auth (Passport.js)                │           │   │
│  │  │  • Validation (Zod)                  │           │   │
│  │  │  • Rate Limiting                     │           │   │
│  │  │  • Security (Helmet, CORS)          │           │   │
│  │  └───────┬──────────────────────────────┘           │   │
│  │  ┌───────▼──────────────────────────────┐           │   │
│  │  │  Business Logic Layer                 │           │   │
│  │  │  • Survey Management                  │           │   │
│  │  │  • Response Collection                │           │   │
│  │  │  • Analytics Processing               │           │   │
│  │  └───────┬──────────────────────────────┘           │   │
│  │  ┌───────▼──────────────────────────────┐           │   │
│  │  │  Data Access Layer (Prisma ORM)      │           │   │
│  │  └───────┬──────────────────────────────┘           │   │
│  └──────────┼──────────────────────────────────────────┘   │
└─────────────┼──────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────┐
│              PostgreSQL Database Container                   │
│  • Survey Definitions                                        │
│  • User Responses                                            │
│  • Session Store                                             │
│  • Audit Logs                                                │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (React SPA)

```
web/src/
├── pages/
│   ├── admin/           # Admin dashboard routes
│   │   ├── AdminDashboard.tsx
│   │   ├── SurveyList.tsx
│   │   ├── SurveyBuilder.tsx
│   │   ├── ResultsPage.tsx
│   │   └── LivePage.tsx
│   └── public/          # Public-facing routes
│       ├── LandingPage.tsx
│       ├── SurveyFlow.tsx
│       ├── ContactPage.tsx
│       └── ThankYouPage.tsx
├── components/          # Reusable UI components
├── contexts/            # React Context providers
│   └── AuthContext.tsx
├── services/            # API client layer
│   └── api.ts
└── types/              # TypeScript definitions
    └── index.ts
```

**Key Design Patterns:**
- **Component-based architecture** - Reusable, composable UI components
- **Context API** - Global state management for authentication
- **Custom hooks** - Encapsulated stateful logic
- **Route-based code splitting** - Optimized bundle loading

### Backend (Express API)

```
api/src/
├── routes/              # API endpoints
│   ├── auth.ts         # Authentication routes
│   ├── surveys.ts      # Public survey routes
│   ├── submissions.ts  # Response submission
│   ├── contacts.ts     # Contact form
│   └── admin.ts        # Admin CRUD operations
├── middleware/          # Request processing
│   ├── auth.ts         # Authentication middleware
│   └── validation.ts   # Request validation
├── services/            # Business logic
│   └── database.ts     # Database connection
├── config/             # Application configuration
│   ├── env.ts          # Environment variables
│   ├── logger.ts       # Logging setup
│   └── passport.ts     # Auth strategy
└── utils/              # Utilities
    ├── errors.ts       # Error handling
    └── response.ts     # Response formatting
```

**Key Design Patterns:**
- **Layered architecture** - Clear separation of concerns
- **Middleware pipeline** - Request processing chain
- **Dependency injection** - Loosely coupled components
- **Repository pattern** - Data access abstraction via Prisma

## Data Model

### Core Entities

```prisma
Survey
├── id, title, description, isActive
├── sections[]
├── submissions[]
└── timestamps
Option
├── id, questionId, label, value, order
├── branchAction?, targetQuestionId?, targetSectionId?, skipToEnd?
└── belongsTo: Question

Submission
├── id, surveyId, eventSlug
├── completedAt, createdAt
├── answers[]
└── belongsTo: Survey

Answer
├── id, submissionId, questionId
├── choiceValues?, textValue?, numberValue?
└── belongsTo: Submission, Question
```
### Relationships

- **One-to-Many**: Survey → Sections → Questions → Options
- **Many-to-Many**: Questions ↔ Answers ↔ Submissions

## API Design

### RESTful Principles

All API endpoints follow RESTful conventions:

- **Resource-based URLs** - `/api/surveys`, `/api/submissions`
- **HTTP verbs** - GET, POST, PATCH, DELETE
- **Status codes** - Proper use of 200, 201, 400, 401, 404, 500
- **Consistent response format**:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional message"
  }
  ```

### Authentication & Authorization

```
Public Routes (No auth required)
├── GET  /api/surveys/active
├── GET  /api/surveys/:id
├── POST /api/submissions
├── POST /api/submissions/:id/answers
└── POST /api/contacts

Admin Routes (Session auth required)
├── POST /api/auth/login
├── POST /api/auth/logout
├── GET  /api/auth/me
└── /api/admin/*
    ├── GET    /surveys
    ├── POST   /surveys
    ├── GET    /surveys/:id
    ├── PATCH  /surveys/:id
    ├── DELETE /surveys/:id
    └── ... (sections, questions, options, etc.)
```

## Security Architecture

### Defense in Depth

1. **Network Layer**
   - CORS with whitelist
   - Rate limiting (100 req/15min public, 10 req/hour submissions)
   - Helmet.js security headers

2. **Application Layer**
   - Input validation with Zod schemas
   - Parameterized queries (Prisma ORM)
   - Session-based authentication
   - CSRF protection via SameSite cookies

3. **Data Layer**
   - PostgreSQL with prepared statements
   - Session store in database
   - Audit logging for admin actions

### Session Management

```javascript
Session Configuration:
├── Store: PostgreSQL (connect-pg-simple)
├── Secret: Environment variable
├── Cookie:
│   ├── httpOnly: true
│   ├── secure: false (local), true (production)
│   ├── sameSite: 'lax'
│   └── maxAge: 24 hours
└── Passport.js Strategy: Local (email/password)
```

## Deployment Architecture

### Docker Compose (Development & Production)

```yaml
services:
  db:
    image: postgres:15-alpine
    ports: ["5433:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    
  app:
    build: .
    ports: ["3001:3001"]
    depends_on: [db]
    environment:
      - DATABASE_URL
      - SESSION_SECRET
```

### Container Build Process

```
Multi-stage Dockerfile:
1. web-builder   → Build React app → /web/dist
2. api-builder   → Build Express app → /api/dist
3. Production    → Combine both + node_modules
   └── Serve static frontend from /public
   └── API from /dist
```

## Performance Considerations

### Frontend Optimization
- Code splitting by route
- Lazy loading of charts/visualizations
- Memoization of expensive computations
- Debounced API calls

### Backend Optimization
- Database connection pooling
- Indexed queries (Prisma)
- Efficient N+1 query prevention
- Response caching headers

### Database Optimization
- Composite indexes on foreign keys
- JSON fields for flexible data (showIf conditions)
- Efficient aggregation queries for analytics

## Scalability Strategy

### Horizontal Scaling
- Stateless API design enables multiple instances
- Session store in PostgreSQL (shared across instances)
- Load balancer distributes traffic

### Vertical Scaling
- Optimize database queries
- Add database read replicas
- Increase container resources

### Caching Layer (Future)
- Redis for session store
- Cache frequently accessed surveys
- Cache analytics computations

## Monitoring & Observability

### Logging
- Structured logging with Pino
- Request/response logging
- Error tracking with stack traces
- Audit log for admin actions

### Metrics (Future Enhancement)
- Response times
- Error rates
- Active sessions
- Database query performance

## Technology Choices Rationale

| Technology | Reason |
|------------|--------|
| **React** | Component-based, large ecosystem, excellent developer experience |
| **TypeScript** | Type safety, better IDE support, fewer runtime errors |
| **Express** | Mature, flexible, extensive middleware ecosystem |
| **Prisma** | Type-safe ORM, excellent DX, automatic migrations |
| **PostgreSQL** | Robust, feature-rich, excellent for relational data |
| **Passport.js** | Battle-tested authentication, multiple strategies |
| **Tailwind CSS** | Utility-first, rapid development, consistent design |
| **Docker** | Consistent environments, easy deployment, isolation |
| **Chart.js** | Lightweight, flexible, well-documented |

## Future Architecture Improvements

1. **Microservices** - Split analytics into separate service
2. **Event-driven** - Use message queue for async processing
3. **CDN** - Serve static assets from CDN
4. **WebSockets** - Real-time survey updates
5. **Multi-tenancy** - Support multiple organizations
6. **API Gateway** - Centralized routing and auth
7. **Kubernetes** - Container orchestration for scale
