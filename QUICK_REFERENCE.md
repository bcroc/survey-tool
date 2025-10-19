# Event Survey Web App - Quick Reference

## 📂 Project Structure

```
event-survey-app/
├── 📄 README.md                 # Project overview
├── 📄 SETUP.md                  # Detailed setup guide
├── 📄 ARCHITECTURE.md           # System architecture & privacy
├── 📄 PROJECT_SUMMARY.md        # What's been built
├── 📄 PRIVACY.md                # User-facing privacy policy
├── 📄 package.json              # Root workspace config
├── 📄 docker-compose.yml        # Docker orchestration
├── 📄 .env.example              # Environment template
├── 🔧 setup.sh                  # Automated setup script
│
├── 📁 api/                      # Backend (Node.js + Express + Prisma)
│   ├── 📄 package.json          # Backend dependencies
│   ├── 📄 tsconfig.json         # TypeScript config
│   ├── 📄 Dockerfile            # API container
│   ├── 📄 jest.config.ts        # Jest test config
│   │
│   ├── 📁 prisma/
│   │   ├── 📄 schema.prisma     # Database schema ⭐
│   │   └── 📄 seed.ts           # Seed script ⭐
│   │
│   ├── 📁 src/
│   │   ├── 📄 index.ts          # Express server entry ⭐
│   │   │
│   │   ├── 📁 middleware/
│   │   │   ├── 📄 auth.ts       # Auth middleware
│   │   │   └── 📄 validation.ts # Zod validation
│   │   │
│   │   └── 📁 routes/
│   │       ├── 📄 auth.ts       # Login/logout
│   │       ├── 📄 surveys.ts    # Public survey routes
│   │       ├── 📄 submissions.ts # Submission routes
│   │       ├── 📄 contacts.ts   # Contact routes ⭐ (privacy)
│   │       └── 📄 admin.ts      # Admin CRUD + analytics ⭐
│   │
│   └── 📁 tests/
│       └── 📄 privacy.test.ts   # Privacy separation tests ⭐
│
└── 📁 web/                      # Frontend (React + TypeScript + Vite)
    ├── 📄 package.json          # Frontend dependencies
    ├── 📄 vite.config.ts        # Vite config + PWA
    ├── 📄 tailwind.config.js    # TailwindCSS config
    ├── 📄 index.html            # HTML entry point
    ├── 📄 Dockerfile            # Web container
    │
    └── 📁 src/
        ├── 📄 main.tsx          # React entry point
        ├── 📄 App.tsx           # Root component + routing ⭐
        ├── 📄 index.css         # TailwindCSS + custom styles
        │
        ├── 📁 types/
        │   └── 📄 index.ts      # TypeScript types
        │
        ├── 📁 services/
        │   └── 📄 api.ts        # API client ⭐
        │
        ├── 📁 contexts/
        │   └── 📄 AuthContext.tsx  # Auth state
        │
        ├── 📁 components/
        │   └── 📄 ProtectedRoute.tsx
        │
        ├── 📁 pages/
        │   ├── 📁 public/
        │   │   ├── 📄 LandingPage.tsx    # ✅ Complete
        │   │   ├── 📄 PrivacyPage.tsx    # ✅ Complete
        │   │   ├── 📄 ThankYouPage.tsx   # ✅ Complete
        │   │   ├── 📄 SurveyFlow.tsx     # ⏳ Needs UI
        │   │   └── 📄 ContactPage.tsx    # ⏳ Needs UI
        │   │
        │   └── 📁 admin/
        │       ├── 📄 AdminLogin.tsx     # ✅ Complete
        │       ├── 📄 AdminDashboard.tsx # ⏳ Needs UI
        │       ├── 📄 SurveyList.tsx     # ⏳ Needs UI
        │       ├── 📄 SurveyBuilder.tsx  # ⏳ Needs UI
        │       ├── 📄 ResultsPage.tsx    # ⏳ Needs UI
        │       ├── 📄 LivePage.tsx       # ⏳ Needs UI
        │       └── 📄 SettingsPage.tsx   # ⏳ Needs UI
        │
        └── 📁 tests/
            └── 📄 setup.ts       # Test setup

Legend:
⭐ = Critical file to understand
✅ = Fully implemented
⏳ = Structure ready, needs UI implementation
```

## ⚡ Quick Commands

```bash
# Setup
./setup.sh                    # Automated setup (recommended)
npm install                   # Install all dependencies
npm run dev                   # Start dev servers (api + web)

# Database
npm run db:push              # Push schema to database
npm run db:studio            # Open Prisma Studio
npm run seed                 # Seed database with demo data

# Testing
npm test                     # Run all tests
npm test --workspace=api     # Backend tests only
npm test --workspace=web     # Frontend tests only

# Linting
npm run lint                 # Lint all
npm run format               # Format all

# Docker
docker-compose up            # Start all services
docker-compose up db         # Start PostgreSQL only
docker-compose down          # Stop all services
docker-compose logs api      # View API logs
```

## 🔑 Default Credentials

```
Email:    admin@example.com
Password: admin123
```

**⚠️ Change in production!**

## 🌐 URLs (Development)

```
Frontend:  http://localhost:5173
Backend:   http://localhost:3001
Database:  postgresql://localhost:5432/event_survey
Health:    http://localhost:3001/health
```

## 📊 Database Tables

```
Survey Definition:
├── Survey          # Survey metadata
├── Section         # Survey sections
├── Question        # Questions (7 types)
└── Option          # Answer options

Responses (Anonymous):
├── Submission      # Submission metadata (UUID)
└── Answer          # Individual answers

Contacts (Separate):
└── Contact         # Optional contact info (NO FK to responses!)

Admin:
├── AdminUser       # Admin accounts
├── AuditLog        # Admin action log
└── Session         # Session store
```

## 🔌 Key API Endpoints

### Public (No Auth)
```
GET  /api/surveys/active?eventSlug=...
GET  /api/surveys/:id
POST /api/submissions
POST /api/submissions/:id/answers
POST /api/submissions/:id/complete
POST /api/contacts                    ← BLOCKS linkage attempts!
```

### Admin (Auth Required)
```
# Auth
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

# Surveys
GET    /api/admin/surveys
GET    /api/admin/surveys/:id
POST   /api/admin/surveys
PATCH  /api/admin/surveys/:id
DELETE /api/admin/surveys/:id

# Analytics
GET /api/admin/metrics/overview?surveyId=...
GET /api/admin/metrics/question/:questionId

# Import/Export
POST /api/admin/import
GET  /api/admin/export/responses.csv?surveyId=...
GET  /api/admin/export/contacts.csv?eventSlug=...

# Audit
GET /api/admin/audit
```

## 🎨 Question Types

```typescript
enum QuestionType {
  SINGLE    // Radio buttons (one choice)
  MULTI     // Checkboxes (multiple choice)
  LIKERT    // 1-5 scale
  TEXT      // Short text input
  LONGTEXT  // Textarea
  NPS       // 0-10 Net Promoter Score
  NUMBER    // Numeric input
}
```

## 🔐 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/event_survey"

# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Session
SESSION_SECRET=your-super-secret-key-change-in-production
SESSION_MAX_AGE=86400000

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Event
DEFAULT_EVENT_SLUG=fall-summit-2025
```

## 🚨 Common Issues & Solutions

### Port already in use
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database connection error
```bash
docker-compose restart db
docker-compose ps  # Check status
```

### Prisma client out of sync
```bash
cd api
npx prisma generate
npm run db:push
```

### Clear and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Next Steps for Development

### 1. Survey Flow (Priority 1)
**File:** `web/src/pages/public/SurveyFlow.tsx`
- Fetch survey from API
- Render multi-step form
- Progress indicator
- Question type renderers
- Auto-save answers
- Validation

### 2. Contact Form (Priority 2)
**File:** `web/src/pages/public/ContactPage.tsx`
- Form fields (name, email, company, role)
- Consent checkbox
- Privacy messaging
- Submit to `/api/contacts`

### 3. Results Dashboard (Priority 3)
**File:** `web/src/pages/admin/ResultsPage.tsx`
- Fetch metrics from `/api/admin/metrics/*`
- Chart.js visualizations
- Export CSV buttons

### 4. Survey Builder (Priority 4)
**File:** `web/src/pages/admin/SurveyBuilder.tsx`
- Drag-and-drop with `@dnd-kit/core`
- CRUD operations for sections/questions
- Question type selector

## 🎯 Privacy Implementation Checklist

When building UI:
- ✅ Never pass `submissionId` to contact form
- ✅ Never display both response + contact data together
- ✅ Keep "Your responses are anonymous" messaging prominent
- ✅ Make contact form clearly optional
- ✅ Show privacy policy link before survey

## 🧪 Testing Commands

```bash
# Run specific test file
cd api && npm test -- privacy.test.ts

# Watch mode
cd api && npm test -- --watch

# Coverage
cd api && npm test -- --coverage

# Frontend tests
cd web && npm test

# Frontend UI tests
cd web && npm test -- --ui
```

## 📚 Key Documentation

1. **README.md** - Start here for overview
2. **SETUP.md** - Detailed setup and next steps
3. **ARCHITECTURE.md** - System design and privacy
4. **PROJECT_SUMMARY.md** - What's been built
5. **PRIVACY.md** - User-facing policy

## 💡 Pro Tips

1. **Backend is 100% ready** - Just consume the API!
2. **Use React Hook Form** - Makes forms much easier
3. **TailwindCSS utilities** - Already configured with custom classes
4. **Check api/src/routes/** - All API logic is there
5. **Prisma Studio** - `npm run db:studio --workspace=api` to view data
6. **Hot Reload** - Changes automatically reload in dev mode

## 🆘 Getting Help

1. Check inline comments in code files
2. Review API route handlers for endpoint behavior
3. Check Prisma schema for data model
4. Read error messages carefully
5. Check browser console for frontend errors
6. Check terminal output for backend errors

## ✅ Features Checklist

### Backend (Complete)
- ✅ Express API
- ✅ TypeScript
- ✅ Prisma ORM
- ✅ PostgreSQL
- ✅ Authentication
- ✅ Rate limiting
- ✅ Validation (Zod)
- ✅ Privacy separation
- ✅ Audit logging
- ✅ CSV exports
- ✅ JSON import
- ✅ Tests

### Frontend (Structure Complete)
- ✅ React + TypeScript
- ✅ Vite build
- ✅ React Router
- ✅ TailwindCSS
- ✅ Auth context
- ✅ API client
- ✅ PWA config
- ✅ Landing page
- ✅ Admin login
- ⏳ Survey flow UI
- ⏳ Admin dashboards UI

## 🎊 You're All Set!

**Everything is ready to go. The backend is production-ready. Now focus on building the UI components!**

**Start with:** `web/src/pages/public/SurveyFlow.tsx`

Good luck! 🚀
