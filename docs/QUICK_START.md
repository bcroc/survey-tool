# Quick Start Guide

Get the Event Survey Application running in 5 minutes!

## TL;DR

```bash
# Clone and start
git clone <repo-url> && cd survey-tool
docker-compose up -d

# Access at http://localhost:3001
# Login: admin@example.com / admin123
```

## Prerequisites

**You need:**
- Docker & Docker Compose installed
- 5 minutes of time

**That's it!** No Node.js, PostgreSQL, or other dependencies required.

## Step-by-Step

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd survey-tool
```

### 2. Start Application

```bash
docker-compose up -d
```

This will:
- ✅ Download required images
- ✅ Build the application
- ✅ Start PostgreSQL database
- ✅ Start web server
- ✅ Seed demo data

**First time?** Build takes 2-3 minutes. Subsequent starts are instant.

### 3. Wait for Startup

```bash
# Check if containers are running
docker-compose ps

# Watch logs (optional)
docker-compose logs -f app
```

Wait for: `Server running on port 3001`

### 4. Access Application

Open browser to: **http://localhost:3001**

You should see the landing page!

### 5. Login to Admin

1. Go to **http://localhost:3001/admin/login**
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click **Login**

🎉 **You're in!** Welcome to the admin dashboard.

## What's Included

The demo includes:
- ✅ Pre-built survey: "Fall Summit 2025 Feedback"
- ✅ 3 sections with various question types
- ✅ Sample questions (Likert, NPS, Multiple Choice, Text)
- ✅ Admin account set up

## Quick Tour

### Take the Demo Survey

1. From landing page, click **Take Survey**
2. Or go to: `http://localhost:3001/survey/[survey-id]`
3. Fill out and submit

### View Results

1. Login to admin
2. Click **Surveys**
3. Click **Results** on any survey
4. See beautiful charts and word clouds!

### Create Your First Survey

1. In admin, go to **Surveys**
2. Click **Create Survey**
3. Fill in title and description
4. Click **Create**
5. Add sections and questions
6. Toggle **Active** to enable
7. Share the link!

## Next Steps

### For Developers

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for:
- Local development without Docker
- Making code changes
- Running tests
- Adding features

### For Production

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for:
- Deploying to a server
- Setting up HTTPS
- Security configuration
- Scaling options

### For Users

See [USER_GUIDE.md](./docs/USER_GUIDE.md) for:
- Creating effective surveys
- Understanding question types
- Analyzing results
- Exporting data

## Common Commands

```bash
# Stop application
docker-compose down

# Restart application
docker-compose restart

# View logs
docker-compose logs -f app

# Update application
git pull
docker-compose up -d --build

# Reset database
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3001
lsof -i :3001

# Change port in docker-compose.yml
ports:
  - "8080:3001"  # Use 8080 instead
```

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Try rebuilding
docker-compose down
docker-compose up -d --build
```

### Can't Access Application

1. Verify containers are running: `docker-compose ps`
2. Check logs: `docker-compose logs app`
3. Try accessing: `http://127.0.0.1:3001`
4. Check firewall settings

### Database Issues

```bash
# Reset database completely
docker-compose down -v
docker-compose up -d

# The -v flag removes volumes (database data)
```

## Environment Customization

Want to customize? Edit `api/.env`:

```env
# Change admin credentials
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password

# Change session secret (important for production!)
SESSION_SECRET=generate-random-string-here

# Change port
PORT=3001
```

Then rebuild:
```bash
docker-compose down
docker-compose up -d --build
```

## Accessing Database

Need to peek at the database?

```bash
# Open PostgreSQL shell
docker-compose exec db psql -U postgres -d event_survey

# View tables
\dt

# Query data
SELECT * FROM "Survey";

# Exit
\q
```

## Stopping the Application

```bash
# Stop containers (data preserved)
docker-compose down

# Stop and remove data
docker-compose down -v
```

## Getting Help

- 📖 **Documentation**: See `/docs` folder
- 🐛 **Bug?** Open an issue on GitHub
- 💡 **Question?** Check USER_GUIDE.md
- 🔧 **Development?** Check DEVELOPMENT.md

## What's Next?

### Immediate Tasks

1. **Change admin password** in Settings
2. **Create your first survey**
3. **Share with users**
4. **View results**

### Before Production

1. ✅ Update admin credentials
2. ✅ Generate strong SESSION_SECRET
3. ✅ Set up HTTPS (see DEPLOYMENT.md)
4. ✅ Configure backups
5. ✅ Test thoroughly

## Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
┌──────▼──────────────────┐
│  Docker Container       │
│  ┌──────────────────┐   │
│  │  Node.js App     │   │
│  │  - Frontend      │   │
│  │  - API           │   │
│  └────────┬─────────┘   │
└───────────┼─────────────┘
            │
┌───────────▼─────────────┐
│  PostgreSQL Container   │
│  - Survey Data          │
│  - Responses            │
│  - Sessions             │
└─────────────────────────┘
```

## Tech Stack Summary

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Charts**: Chart.js + React Wordcloud
- **Container**: Docker + Docker Compose

## Key Features

✅ **7 Question Types** - Single, Multi, Likert, NPS, Text, Long Text, Number
✅ **Conditional Logic** - Show/hide questions based on answers
✅ **Branching** - Skip sections based on responses
✅ **Rich Analytics** - Charts, word clouds, statistics
✅ **Export Data** - CSV download
✅ **Responsive** - Works on mobile, tablet, desktop
✅ **Secure** - Authentication, validation, rate limiting
✅ **Easy Deploy** - Single Docker command

## Support

Need help? Check these resources:

1. **README.md** - Overview and features
2. **docs/USER_GUIDE.md** - How to use the app
3. **docs/DEVELOPMENT.md** - Development setup
4. **docs/API.md** - API documentation
5. **docs/DEPLOYMENT.md** - Production deployment

---

**Ready to start? Run:**

```bash
docker-compose up -d
```

Then open **http://localhost:3001** 🚀
