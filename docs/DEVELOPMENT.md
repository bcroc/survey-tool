# Development Guide

Complete guide for local development setup and workflows.

## Prerequisites

### Required Software
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **PostgreSQL** 15+ (or Docker)
- **Git**

### Recommended Tools
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Prisma
  - TypeScript
- **Postman** or **Thunder Client** for API testing
- **pgAdmin** or **TablePlus** for database management

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd survey-tool
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# This installs both api/ and web/ packages
```

### 3. Environment Configuration

Create environment files from examples:

```bash
# API environment
cp api/.env.example api/.env

# Web environment
cp web/.env.example web/.env
```

Edit `api/.env`:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/survey_dev
SESSION_SECRET=your-dev-secret-change-in-production
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

Edit `web/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb survey_dev

# Push schema to database
npm run db:push

# Seed with demo data
npm run seed
```

#### Option B: Docker PostgreSQL

```bash
# Start PostgreSQL container
docker run -d \
  --name survey-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=survey_dev \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for database to start
sleep 5

# Push schema and seed
npm run db:push
npm run seed
```

### 5. Start Development Servers

```bash
# Start both API and web dev servers concurrently
npm run dev

# API will be at http://localhost:3001
# Frontend will be at http://localhost:5173
```

Or start them separately in different terminals:

```bash
# Terminal 1: API server
npm run dev --workspace=api

# Terminal 2: Web server
npm run dev --workspace=web
```

## Project Structure

```
survey-tool/
├── api/                          # Backend workspace
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Seed script
│   ├── src/
│   │   ├── config/              # Configuration
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Utilities
│   │   └── index.ts             # Entry point
│   ├── tests/                   # API tests
│   ├── package.json
│   └── tsconfig.json
│
├── web/                          # Frontend workspace
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── contexts/            # React contexts
│   │   ├── pages/
│   │   │   ├── admin/          # Admin pages
│   │   │   └── public/         # Public pages
│   │   ├── services/           # API client
│   │   ├── types/              # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/                   # Frontend tests
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── docs/                         # Documentation
├── docker-compose.yml
├── Dockerfile
└── package.json                  # Root workspace config
```

## Development Workflows

### Database Management

#### Viewing Data

```bash
# Open Prisma Studio (database GUI)
cd api
npx prisma studio

# Opens at http://localhost:5555
```

#### Schema Changes

```bash
# After editing prisma/schema.prisma
npm run db:push

# Generate Prisma Client
cd api
npx prisma generate
```

#### Reset Database

```bash
# Delete all data and reseed
cd api
npx prisma migrate reset

# Or manually
npx prisma db push --force-reset
npm run seed
```

### Code Quality

#### Linting

```bash
# Lint all code
npm run lint

# Lint specific workspace
npm run lint --workspace=api
npm run lint --workspace=web

# Auto-fix issues
npm run lint -- --fix
```

#### Formatting

```bash
# Format all code
npm run format

# Format specific workspace
npm run format --workspace=api
npm run format --workspace=web
```

#### Type Checking

```bash
# TypeScript check (automatic during dev)
npm run build

# Check specific workspace
npm run build --workspace=api
npm run build --workspace=web
```

### Testing

#### Run Tests

```bash
# Run all tests
npm test

# Run API tests
npm test --workspace=api

# Run frontend tests
npm test --workspace=web

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

#### Writing Tests

**API Test Example:**
```typescript
// api/tests/example.test.ts
import { describe, it, expect } from 'vitest';

describe('Survey API', () => {
  it('should create a survey', async () => {
    // Test implementation
  });
});
```

**Frontend Test Example:**
```typescript
// web/src/tests/example.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### API Development

#### Adding a New Endpoint

1. **Define Route** (`api/src/routes/example.ts`):
```typescript
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/example', requireAuth, async (req, res, next) => {
  try {
    const data = await prisma.example.findMany();
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
```

2. **Register Route** (`api/src/index.ts`):
```typescript
import exampleRoutes from './routes/example';
app.use('/api/example', exampleRoutes);
```

3. **Test Endpoint**:
```bash
curl http://localhost:3001/api/example
```

#### Adding Validation

```typescript
import { z } from 'zod';
import { validate } from '../middleware/validation';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  email: z.string().email(),
});

router.post('/example', validate(createSchema), async (req, res) => {
  // Validated data in req.body
});
```

### Frontend Development

#### Adding a New Page

1. **Create Component** (`web/src/pages/example/ExamplePage.tsx`):
```typescript
export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1>Example Page</h1>
    </div>
  );
}
```

2. **Add Route** (`web/src/App.tsx`):
```typescript
import ExamplePage from './pages/example/ExamplePage';

<Route path="/example" element={<ExamplePage />} />
```

#### Using the API

```typescript
import { api } from '../services/api';

// GET request
const response = await api.get('/endpoint');
const data = response.data;

// POST request
const response = await api.post('/endpoint', { data });

// With error handling
try {
  const response = await api.get('/endpoint');
  setData(response.data);
} catch (error) {
  setError(error.response?.data?.error || 'Failed');
}
```

#### Styling with Tailwind

```typescript
// Use existing classes
<div className="card">
  <h2 className="mb-3">Title</h2>
  <button className="btn-primary">Click</button>
</div>

// Custom styles in index.css
@layer components {
  .my-component {
    @apply rounded-lg shadow-md p-4;
  }
}
```

## Debugging

### Backend Debugging

**VS Code Launch Configuration** (`.vscode/launch.json`):
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug API",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev", "--workspace=api"],
  "skipFiles": ["<node_internals>/**"],
  "console": "integratedTerminal"
}
```

**Or use Node inspector:**
```bash
cd api
node --inspect dist/index.js
```

### Frontend Debugging

Use React DevTools browser extension and browser console.

**Adding Debug Logs:**
```typescript
console.log('Debug:', variable);
console.table(arrayData);
console.trace('Trace call stack');
```

### Database Debugging

**View Prisma Queries:**
```bash
# Set environment variable
DATABASE_URL="postgresql://...?connection_limit=5&query_log=true"

# Or in code
const prisma = new PrismaClient({ log: ['query'] });
```

## Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Regenerate Prisma client
cd api
npx prisma generate

# Clear TypeScript cache
rm -rf api/dist web/dist
npm run build
```

## Performance Profiling

### Backend Profiling

```bash
# Use Node.js profiler
node --prof dist/index.js

# Generate flame graph
npm install -g clinic
clinic doctor -- node dist/index.js
```

### Frontend Profiling

Use React DevTools Profiler tab to identify slow components.

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

**Commit Message Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## Hot Module Replacement (HMR)

Both API and web support HMR:
- **Frontend**: Instant updates via Vite HMR
- **Backend**: Auto-restart via `tsx` watch mode

Changes are reflected immediately without full restart!

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)
