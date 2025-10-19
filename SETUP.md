# Event Survey Web App - Setup Guide

## 🎯 Project Overview

You now have a comprehensive full-stack event survey application with:
- **Backend**: Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Auth**: Session-based authentication with Passport.js
- **Privacy**: Complete data separation between responses and contacts
- **Testing**: Jest (backend) + Vitest (frontend)
- **Docker**: Full containerization with docker-compose

## 📦 What Has Been Created

### Backend (`/api`)
✅ Complete Prisma schema with privacy guarantees
✅ Express server with all routes:
  - Public: submissions, contacts, surveys
  - Admin: CRUD operations, analytics, import/export
✅ Passport.js authentication
✅ Comprehensive seed script with demo data
✅ Privacy tests
✅ Middleware (auth, validation, rate limiting)

### Frontend (`/web`)
✅ React app structure with routing
✅ Authentication context and protected routes
✅ API service layer
✅ TypeScript types
✅ TailwindCSS configuration
✅ PWA setup with offline support
✅ Landing page and admin login (full implementation)
✅ Placeholder pages for survey flow, results, etc.

### Infrastructure
✅ Docker compose configuration
✅ Environment variables template
✅ Comprehensive README
✅ Privacy policy document
✅ ESLint and Prettier configuration

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install API dependencies
cd api
npm install

# Install web dependencies
cd ../web
npm install

cd ..
```

### Step 2: Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your preferences (optional for development)
# Default values work out of the box
```

### Step 3: Start PostgreSQL

```bash
# Start PostgreSQL with Docker
docker-compose up db -d

# Wait a few seconds for the database to be ready
```

### Step 4: Setup Database

```bash
# Generate Prisma client and push schema
npm run db:push

# Seed with demo data
npm run seed
```

You should see output like:
```
✅ Admin created: admin@example.com
✅ Survey created: Fall Summit 2025 Feedback
✅ 25 responses created
✅ 10 contacts created
```

### Step 5: Start Development Servers

```bash
# Start both frontend and backend
npm run dev
```

This starts:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173

### Step 6: Access the Application

**Public Survey:**
- Open http://localhost:5173
- Click "Start Survey"

**Admin Dashboard:**
- Go to http://localhost:5173/admin/login
- Email: `admin@example.com`
- Password: `admin123`

## 📝 Next Steps for Full Implementation

The project structure is complete, but several components need full implementation:

### Priority 1: Survey Flow (Public)
**File**: `web/src/pages/public/SurveyFlow.tsx`

Need to implement:
- Multi-step form with sections
- Progress indicator
- Question rendering for all types (LIKERT, NPS, MULTI, etc.)
- Answer persistence (auto-save)
- Validation
- Navigation between steps
- Review screen before submission

**Example structure**:
```tsx
const SurveyFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  
  // Fetch survey
  // Render current section/question
  // Handle answer changes
  // Auto-save to API
  // Navigate between steps
  // Submit on complete
}
```

### Priority 2: Contact Form
**File**: `web/src/pages/public/ContactPage.tsx`

Implement:
- Form with name, email, company, role
- Consent checkbox
- Clear messaging about privacy
- Form validation
- API submission

### Priority 3: Admin Survey Builder
**File**: `web/src/pages/admin/SurveyBuilder.tsx`

Implement:
- Section CRUD operations
- Question CRUD with drag-drop reordering
- Option management
- Question type selector
- Live preview
- Save/publish functionality

Consider using a library like `@dnd-kit/core` for drag-and-drop.

### Priority 4: Results/Analytics Dashboard
**File**: `web/src/pages/admin/ResultsPage.tsx`

Implement:
- Overview KPIs (using `/api/admin/metrics/overview`)
- Chart.js visualizations:
  - Bar charts for single/multi choice
  - Line charts for time series
  - Histograms for Likert/NPS
- Filters (date range, question)
- Export buttons (CSV download)

**Example with Chart.js**:
```tsx
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// In component:
<Bar data={chartData} options={chartOptions} />
```

### Priority 5: Admin Dashboard
**File**: `web/src/pages/admin/AdminDashboard.tsx`

Implement:
- Summary cards (total surveys, responses today, etc.)
- Recent activity feed
- Quick action buttons
- Links to surveys

### Priority 6: Live Results
**File**: `web/src/pages/admin/LivePage.tsx`

Implement:
- Auto-refresh every 10 seconds using `useEffect` + `setInterval`
- Real-time charts
- Response counter

### Priority 7: Survey List
**File**: `web/src/pages/admin/SurveyList.tsx`

Implement:
- Table of surveys
- Create new survey button
- Edit/Delete/View Results actions
- Active/Inactive toggle
- Search/filter

### Priority 8: Settings Page
**File**: `web/src/pages/admin/SettingsPage.tsx`

Implement:
- Audit log viewer
- Account settings
- Password change
- Event configuration

## 🧪 Testing

### Backend Tests

```bash
cd api
npm test
```

The privacy tests are already implemented in `api/tests/privacy.test.ts`.

Add more tests for:
- API routes
- Authentication
- Validation
- Business logic

### Frontend Tests

```bash
cd web
npm test
```

Create tests in `web/src/tests/` for:
- Components
- User flows
- API integration
- Form validation

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `SESSION_SECRET` to a strong random value
- [ ] Change admin password (or add proper user management)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (update `cookie.secure` to true)
- [ ] Review and update CORS origins
- [ ] Set up proper database backups
- [ ] Review rate limiting settings
- [ ] Enable database connection pooling
- [ ] Set up proper logging/monitoring
- [ ] Review and test all privacy guarantees

## 📊 Database Schema Notes

The Prisma schema implements strict privacy separation:

1. **No Foreign Keys** between `Contact` and `Submission`/`Answer` tables
2. **Only `eventSlug`** is shared (non-linkable identifier)
3. **Separate exports** - responses and contacts never mixed
4. **Privacy tests** verify the separation

To view the database:
```bash
npm run db:studio --workspace=api
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up
```

### Production
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec api npm run db:migrate

# Seed database
docker-compose exec api npm run seed
```

## 📚 Key Libraries & Documentation

### Backend
- **Express**: https://expressjs.com/
- **Prisma**: https://www.prisma.io/docs
- **Passport**: http://www.passportjs.org/
- **Zod**: https://zod.dev/

### Frontend
- **React**: https://react.dev/
- **React Router**: https://reactrouter.com/
- **TailwindCSS**: https://tailwindcss.com/
- **Chart.js**: https://www.chartjs.org/
- **React Hook Form**: https://react-hook-form.com/

## 🎨 UI/UX Guidelines

### Design Principles
- **Mobile-first**: All components should work on mobile
- **Large tap targets**: Minimum 44x44px for buttons
- **Clear labels**: Every input has a visible label
- **Error messages**: Show validation errors inline
- **Loading states**: Show skeletons while loading
- **Empty states**: Friendly messages when no data

### Accessibility
- Use semantic HTML
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast (WCAG AA)

## 🔄 Development Workflow

### Adding a New Question Type

1. Update `prisma/schema.prisma` enum
2. Run `npm run db:push --workspace=api`
3. Update frontend `types/index.ts`
4. Add rendering logic in survey flow
5. Update analytics/charts for new type

### Adding a New API Endpoint

1. Create route in `api/src/routes/`
2. Add validation schema (Zod)
3. Implement handler
4. Add to middleware chain
5. Update frontend API service
6. Add tests

## 📈 Performance Tips

- Use React.memo() for expensive components
- Implement virtual scrolling for long lists
- Use Chart.js `maintainAspectRatio: false` for responsive charts
- Enable Prisma query logging in development
- Use database indexes for frequently queried fields
- Implement pagination for large datasets

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port in .env
PORT=3002
```

### Database Connection Error
```bash
# Restart PostgreSQL
docker-compose restart db

# Check if it's running
docker-compose ps
```

### Prisma Client Out of Sync
```bash
cd api
npx prisma generate
npm run db:push
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support & Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **React Docs**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **TailwindCSS**: https://tailwindcss.com/docs

## ✅ Acceptance Criteria Checklist

From the original spec:

- [ ] Complete survey on mobile in < 2 minutes
- [ ] Separate contact form after survey completion
- [ ] Skip contact form shows thank you page
- [ ] Responses CSV has no contact info
- [ ] Contacts CSV has no response identifiers
- [ ] Admin dashboard shows updating charts
- [ ] Drag-and-drop question reordering
- [ ] JSON survey import works
- [ ] CSV exports work correctly
- [ ] Offline mode queues submissions
- [ ] Privacy tests pass
- [ ] WCAG AA accessible

## 🎉 You're All Set!

The foundation is complete. Focus on implementing the UI components for the survey flow and admin dashboard. The backend is fully functional and ready to support all features.

Good luck! 🚀
