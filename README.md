# Event Survey Application# Event Survey Web App



A full-stack survey management system built with React, TypeScript, Node.js, Express, PostgreSQL, and Prisma. This application enables organizations to create, manage, and analyze event feedback surveys with advanced features including conditional logic, branching, and rich analytics with visualizations.## ⚡ SIMPLIFIED ARCHITECTURE - NOW ONLY 2 CONTAINERS!



![Version](https://img.shields.io/badge/version-1.0.0-blue)> **This application has been dramatically simplified from 3 containers to just 2!**  

![License](https://img.shields.io/badge/license-MIT-green)> 🎉 33% fewer containers • 50% fewer ports • 22% less memory • 25% faster startup  

> 📖 See [SIMPLIFICATION_GUIDE.md](SIMPLIFICATION_GUIDE.md) for details

## ✨ Features

A full-stack web application for running quick on-site event surveys with anonymous responses and optional contact collection. Features an admin dashboard for managing surveys and viewing real-time analytics.

### 📊 Survey Management

- **Dynamic Survey Builder** - Create surveys with multiple question types## 🎯 Features

- **Conditional Logic** - Show/hide questions based on previous answers

- **Branching Rules** - Skip to specific sections or end survey based on responses### Attendee Flow (Public)

- **Real-time Preview** - See how your survey looks as you build it- **Anonymous Survey Submission**: Complete surveys without any identifying information

- **Multiple Question Types**: Single choice, multiple choice, Likert scale (1-5), text, long text, NPS (0-10), and numeric inputs

### 📝 Question Types- **Progress Tracking**: Visual progress indicator as you complete sections

- Single Choice (Radio buttons)- **Privacy First**: Clear explanation of data handling before starting

- Multiple Choice (Checkboxes)- **Optional Contact Form**: Provide contact details after submission (completely separate from responses)

- Likert Scale (1-5 rating)- **Offline Support**: PWA with offline capability to queue submissions when connection is lost

- Net Promoter Score (0-10)- **Mobile Optimized**: Responsive design with large tap targets

- Text Input (Short answer)

- Long Text (Essay/paragraph)### Admin Dashboard (Protected)

- Number Input- **Survey Management**: Full CRUD for surveys, sections, questions, and options

- **Drag & Drop Builder**: Reorder questions and sections with intuitive drag-and-drop

### 📈 Advanced Analytics- **Real-time Analytics**: Live dashboard with auto-refreshing charts

- **Interactive Charts** - Bar charts, doughnut charts, and histograms- **Rich Visualizations**: Bar charts, stacked bars, histograms, NPS scores, word clouds

- **Word Clouds** - Beautiful text analysis for open-ended responses- **Import/Export**: 

- **Real-time Metrics** - Completion rates, response counts, average times  - Import survey definitions via JSON

- **Question-level Analysis** - Detailed breakdowns per question  - Export responses and contacts as separate CSV files

- **Export Data** - Download responses as CSV- **Audit Logging**: Track all admin actions for compliance

- **Filters**: Analyze data by time window, question, or survey version

### 🎨 Modern UI/UX

- Responsive design for all devices### Privacy & Security

- Accessible (WCAG 2.1 AA compliant)- **Complete Data Separation**: Responses and contacts stored in separate tables with no linkage

- Clean, intuitive interface- **No Tracking**: Submissions use random UUIDs with no connection to contact information

- Smooth animations and transitions- **Session-based Auth**: Secure httpOnly cookies for admin authentication

- **CSRF Protection**: Cross-site request forgery protection on all admin endpoints

### 🔒 Security- **Rate Limiting**: Prevent abuse on public endpoints

- Secure authentication with Passport.js- **Input Validation**: Zod schemas for all API inputs

- Session management with PostgreSQL

- CORS protection### Accessibility (WCAG 2.1 AA Compliant)

- Rate limiting- **Keyboard Navigation**: Full keyboard support with visible focus indicators

- Input validation with Zod- **Screen Reader Support**: Proper ARIA labels, roles, and live regions

- SQL injection protection with Prisma- **Skip Navigation**: Skip-to-content link for keyboard users

- **High Contrast**: Support for high contrast mode preferences

## 🚀 Quick Start- **Reduced Motion**: Respects prefers-reduced-motion settings

- **Semantic HTML**: Proper heading hierarchy and landmarks

### Prerequisites

- Docker & Docker Compose (recommended)📖 **See [ACCESSIBILITY.md](ACCESSIBILITY.md) for detailed accessibility documentation**

- OR Node.js 18+ and PostgreSQL 15+

## 🏗️ Architecture

### Option 1: Docker (Recommended)

### Simplified 2-Container Design

```bash

# Clone the repository**Container 1: PostgreSQL Database**

git clone <your-repo-url>- PostgreSQL 15 Alpine

cd survey-tool- Data persistence with Docker volumes

- Exposed on port 5433 for local development

# Start the application

docker-compose up -d**Container 2: Unified Application**

- Single Node.js/Express server

# The app will be available at http://localhost:3001- Serves REST API at `/api/*`

```- Serves built React frontend as static files

- Runs on port 3001

That's it! The application includes:- No separate web server needed!

- Frontend served at `http://localhost:3001`

- API at `http://localhost:3001/api`### Tech Stack

- Pre-seeded demo survey and admin account

**Frontend** (`/web`)

**Default Admin Credentials:**- React 18 + TypeScript

- Email: `admin@example.com`- Vite (build tool)

- Password: `admin123`- React Router v6

- TailwindCSS (styling)

### Option 2: Local Development- Chart.js (visualizations)

- React Testing Library + Vitest

```bash

# Install dependencies**Backend** (`/api`)

npm install- Node.js + Express + TypeScript

- Prisma ORM

# Set up environment variables- PostgreSQL

cp api/.env.example api/.env- Passport.js (authentication)

cp web/.env.example web/.env- Jest (testing)

- Pino (structured logging)

# Start PostgreSQL (adjust connection string in api/.env)

**Infrastructure**

# Push database schema- Docker + Docker Compose (2 containers only!)

npm run db:push- PostgreSQL 15



# Seed database with demo data## 🚀 Quick Start

npm run seed

### Prerequisites

# Start development servers- Docker & Docker Compose

npm run dev- (Optional) Node.js >= 18.0.0 for local development



# Frontend: http://localhost:5173### Production Setup (Docker - Recommended)

# API: http://localhost:3001

```**Fastest way - Single command:**

```bash

## 📖 Documentationchmod +x setup-simple.sh

./setup-simple.sh

- [Architecture Overview](./docs/ARCHITECTURE.md) - System design and technical decisions```

- [API Reference](./docs/API.md) - Complete API documentation

- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructionsThis script will:

- [Development Guide](./docs/DEVELOPMENT.md) - Local development setup1. Check prerequisites

- [User Guide](./docs/USER_GUIDE.md) - How to use the application2. Create `.env` file if needed

3. Build and start both containers

## 🏗️ Project Structure4. Run database migrations

5. Seed with sample data

```

survey-tool/**Manual Docker setup:**

├── api/                      # Backend API```bash

│   ├── prisma/              # Database schema and migrations# 1. Create environment file

│   │   ├── schema.prisma    # Prisma schema definitioncp .env.example .env

│   │   └── seed.ts          # Database seeding script# Edit .env with your configuration

│   ├── src/

│   │   ├── config/          # Configuration (env, logger, passport)# 2. Build and start containers

│   │   ├── middleware/      # Express middlewaredocker-compose up -d --build

│   │   ├── routes/          # API routes

│   │   ├── services/        # Business logic# 3. Run migrations and seed

│   │   └── utils/           # Utilitiesdocker-compose exec app npm run db:push

│   └── tests/               # API testsdocker-compose exec app npm run seed

├── web/                     # Frontend React app```

│   ├── src/

│   │   ├── components/      # Reusable components**Access the application:**

│   │   ├── contexts/        # React contexts- Frontend & API: http://localhost:3001

│   │   ├── pages/           # Page components- Database: localhost:5433

│   │   │   ├── admin/      # Admin dashboard pages

│   │   │   └── public/     # Public-facing pages### Local Development (Without Docker)

│   │   ├── services/        # API client

│   │   └── types/           # TypeScript types1. **Start PostgreSQL**

│   └── tests/               # Frontend tests```bash

├── docker-compose.yml       # Docker orchestrationdocker-compose up db -d

├── Dockerfile              # Multi-stage Docker build```

└── package.json            # Root package with workspaces

```2. **Install dependencies**

```bash

## 🛠️ Technology Stacknpm install

```

### Frontend

- **React 18** - UI framework3. **Setup database**

- **TypeScript** - Type safety```bash

- **React Router** - Navigationnpm run db:push

- **Tailwind CSS** - Stylingnpm run seed

- **Chart.js** - Data visualization```

- **React Wordcloud** - Text analysis

- **Axios** - HTTP client4. **Start development servers**

- **Vite** - Build tool```bash

npm run dev

### Backend```

- **Node.js** - Runtime

- **Express** - Web frameworkDevelopment URLs:

- **TypeScript** - Type safety- Frontend: http://localhost:5173

- **Prisma** - ORM- Backend API: http://localhost:3001

- **PostgreSQL** - Database

- **Passport.js** - Authentication### Default Admin Credentials

- **Zod** - Validation- Email: `admin@example.com`

- **Helmet** - Security- Password: `admin123`

- **Pino** - Logging

**⚠️ Change these in production!**

### DevOps

- **Docker** - Containerization## 📁 Project Structure

- **Docker Compose** - Multi-container orchestration

```

## 🧪 Testingevent-survey-app/

├── api/                      # Backend Express API

```bash│   ├── src/

# Run all tests│   │   ├── routes/          # API route handlers

npm test│   │   ├── middleware/      # Express middleware

│   │   ├── services/        # Business logic

# Run API tests│   │   ├── utils/           # Helpers and utilities

npm test --workspace=api│   │   ├── types/           # TypeScript types

│   │   └── index.ts         # Entry point

# Run frontend tests│   ├── prisma/

npm test --workspace=web│   │   ├── schema.prisma    # Database schema

│   │   └── seed.ts          # Seed data

# Run tests with coverage│   ├── tests/               # Jest tests

npm test -- --coverage│   └── package.json

```├── web/                      # Frontend React app

│   ├── src/

## 📦 Building for Production│   │   ├── components/      # React components

│   │   ├── pages/           # Route pages

```bash│   │   ├── hooks/           # Custom hooks

# Build both frontend and API│   │   ├── services/        # API client

npm run build│   │   ├── types/           # TypeScript types

│   │   └── App.tsx          # Root component

# Or build individually│   ├── public/              # Static assets

npm run build --workspace=web│   ├── tests/               # Vitest tests

npm run build --workspace=api│   └── package.json

├── docker-compose.yml        # Docker orchestration

# Build Docker image├── .env.example             # Environment template

docker-compose build└── package.json             # Root workspace config

``````



## 🔧 Configuration## 🧪 Testing



### Environment Variables```bash

# Run all tests

**API (`api/.env`)**npm test

```env

NODE_ENV=production# Run backend tests only

PORT=3001npm test --workspace=api

DATABASE_URL=postgresql://user:pass@localhost:5432/survey

SESSION_SECRET=your-secret-key# Run frontend tests only

FRONTEND_URL=http://localhost:3001npm test --workspace=web

```

# Run tests in watch mode

**Web (`web/.env`)**npm test --workspace=api -- --watch

```env```

VITE_API_URL=http://localhost:3001/api

```## 🔒 Privacy Guarantees



## 🤝 ContributingThe application implements strict privacy separation:



1. Fork the repository1. **No Linkage**: Responses and contacts are stored in completely separate tables

2. Create a feature branch (`git checkout -b feature/amazing-feature`)2. **No Foreign Keys**: The database schema has NO foreign keys between responses and contacts

3. Commit your changes (`git commit -m 'Add amazing feature'`)3. **No Shared Identifiers**: Only `eventSlug` is shared, which is a non-linkable event code

4. Push to the branch (`git push origin feature/amazing-feature`)4. **Separate Exports**: CSV exports are completely separate with no cross-identifiers

5. Open a Pull Request5. **API Validation**: Contact endpoint explicitly rejects any submission identifiers

6. **Unit Tests**: Automated tests verify the separation at schema and API levels

## 📝 License

See `PRIVACY.md` for the complete privacy policy shown to attendees.

This project is licensed under the MIT License.

## 📊 Survey JSON Import Format

## 🙏 Acknowledgments

```json

- Chart.js for beautiful visualizations{

- Prisma for the excellent ORM  "title": "Fall Summit Pulse",

- The React team for an amazing framework  "description": "5-min rapid feedback",

- All open-source contributors  "sections": [

    {

## 📞 Support      "title": "Experience",

      "questions": [

For issues, questions, or contributions:        {

- Open an issue on GitHub          "type": "LIKERT",

- Check existing documentation          "prompt": "Rate registration experience",

- Contact the development team          "required": true

        },

---        {

          "type": "SINGLE",

Made with ❤️ by the Survey Tool Team          "prompt": "Favorite session",

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
