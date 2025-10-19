# Event Survey Web App

## ⚡ SIMPLIFIED ARCHITECTURE - NOW ONLY 2 CONTAINERS!

> **This application has been dramatically simplified from 3 containers to just 2!**  
> 🎉 33% fewer containers • 50% fewer ports • 22% less memory • 25% faster startup  
> 📖 See [SIMPLIFICATION_GUIDE.md](SIMPLIFICATION_GUIDE.md) for details

A full-stack web application for running quick on-site event surveys with anonymous responses and optional contact collection. Features an admin dashboard for managing surveys and viewing real-time analytics.

## 🎯 Features

### Attendee Flow (Public)
- **Anonymous Survey Submission**: Complete surveys without any identifying information
- **Multiple Question Types**: Single choice, multiple choice, Likert scale (1-5), text, long text, NPS (0-10), and numeric inputs
- **Progress Tracking**: Visual progress indicator as you complete sections
- **Privacy First**: Clear explanation of data handling before starting
- **Optional Contact Form**: Provide contact details after submission (completely separate from responses)
- **Offline Support**: PWA with offline capability to queue submissions when connection is lost
- **Mobile Optimized**: Responsive design with large tap targets

### Admin Dashboard (Protected)
- **Survey Management**: Full CRUD for surveys, sections, questions, and options
- **Drag & Drop Builder**: Reorder questions and sections with intuitive drag-and-drop
- **Real-time Analytics**: Live dashboard with auto-refreshing charts
- **Rich Visualizations**: Bar charts, stacked bars, histograms, NPS scores, word clouds
- **Import/Export**: 
  - Import survey definitions via JSON
  - Export responses and contacts as separate CSV files
- **Audit Logging**: Track all admin actions for compliance
- **Filters**: Analyze data by time window, question, or survey version

### Privacy & Security
- **Complete Data Separation**: Responses and contacts stored in separate tables with no linkage
- **No Tracking**: Submissions use random UUIDs with no connection to contact information
- **Session-based Auth**: Secure httpOnly cookies for admin authentication
- **CSRF Protection**: Cross-site request forgery protection on all admin endpoints
- **Rate Limiting**: Prevent abuse on public endpoints
- **Input Validation**: Zod schemas for all API inputs
- **WCAG AA Compliant**: Keyboard navigable with proper ARIA labels

## 🏗️ Architecture

### Simplified 2-Container Design

**Container 1: PostgreSQL Database**
- PostgreSQL 15 Alpine
- Data persistence with Docker volumes
- Exposed on port 5433 for local development

**Container 2: Unified Application**
- Single Node.js/Express server
- Serves REST API at `/api/*`
- Serves built React frontend as static files
- Runs on port 3001
- No separate web server needed!

### Tech Stack

**Frontend** (`/web`)
- React 18 + TypeScript
- Vite (build tool)
- React Router v6
- TailwindCSS (styling)
- Chart.js (visualizations)
- React Testing Library + Vitest

**Backend** (`/api`)
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- Passport.js (authentication)
- Jest (testing)
- Pino (structured logging)

**Infrastructure**
- Docker + Docker Compose (2 containers only!)
- PostgreSQL 15

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- (Optional) Node.js >= 18.0.0 for local development

### Production Setup (Docker - Recommended)

**Fastest way - Single command:**
```bash
chmod +x setup-simple.sh
./setup-simple.sh
```

This script will:
1. Check prerequisites
2. Create `.env` file if needed
3. Build and start both containers
4. Run database migrations
5. Seed with sample data

**Manual Docker setup:**
```bash
# 1. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 2. Build and start containers
docker-compose up -d --build

# 3. Run migrations and seed
docker-compose exec app npm run db:push
docker-compose exec app npm run seed
```

**Access the application:**
- Frontend & API: http://localhost:3001
- Database: localhost:5433

### Local Development (Without Docker)

1. **Start PostgreSQL**
```bash
docker-compose up db -d
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup database**
```bash
npm run db:push
npm run seed
```

4. **Start development servers**
```bash
npm run dev
```

Development URLs:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Default Admin Credentials
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ Change these in production!**

## 📁 Project Structure

```
event-survey-app/
├── api/                      # Backend Express API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers and utilities
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   ├── tests/               # Jest tests
│   └── package.json
├── web/                      # Frontend React app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Root component
│   ├── public/              # Static assets
│   ├── tests/               # Vitest tests
│   └── package.json
├── docker-compose.yml        # Docker orchestration
├── .env.example             # Environment template
└── package.json             # Root workspace config
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm test --workspace=api

# Run frontend tests only
npm test --workspace=web

# Run tests in watch mode
npm test --workspace=api -- --watch
```

## 🔒 Privacy Guarantees

The application implements strict privacy separation:

1. **No Linkage**: Responses and contacts are stored in completely separate tables
2. **No Foreign Keys**: The database schema has NO foreign keys between responses and contacts
3. **No Shared Identifiers**: Only `eventSlug` is shared, which is a non-linkable event code
4. **Separate Exports**: CSV exports are completely separate with no cross-identifiers
5. **API Validation**: Contact endpoint explicitly rejects any submission identifiers
6. **Unit Tests**: Automated tests verify the separation at schema and API levels

See `PRIVACY.md` for the complete privacy policy shown to attendees.

## 📊 Survey JSON Import Format

```json
{
  "title": "Fall Summit Pulse",
  "description": "5-min rapid feedback",
  "sections": [
    {
      "title": "Experience",
      "questions": [
        {
          "type": "LIKERT",
          "prompt": "Rate registration experience",
          "required": true
        },
        {
          "type": "SINGLE",
          "prompt": "Favorite session",
          "options": ["Keynote", "Panel", "Workshop"]
        },
        {
          "type": "TEXT",
          "prompt": "One thing to improve?"
        }
      ]
    }
  ]
}
```

## 🚢 Deployment

### Docker Deployment

Build and run all services:
```bash
docker-compose up -d
```

Run migrations in production:
```bash
docker-compose exec api npm run db:migrate
docker-compose exec api npm run seed
```

### Environment Variables

See `.env.example` for all required environment variables. Critical ones:

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Strong random secret for session encryption
- `FRONTEND_URL`: Frontend URL for CORS
- `NODE_ENV`: Set to `production` in production

## 🛠️ Development Scripts

```bash
# Start development servers (API + Web)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Push schema changes to database (dev)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Seed database with demo data
npm run seed
```

## 📸 Screenshots

### Attendee Flow
![Survey Landing Page](./docs/screenshots/landing.png)
![Survey Progress](./docs/screenshots/survey-progress.png)
![Contact Form](./docs/screenshots/contact.png)

### Admin Dashboard
![Survey Builder](./docs/screenshots/admin-builder.png)
![Analytics Dashboard](./docs/screenshots/admin-analytics.png)
![Live Results](./docs/screenshots/admin-live.png)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with privacy-first principles
- Compliant with WCAG AA accessibility standards
- Follows OWASP security best practices
