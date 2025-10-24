# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-19

### Added
- **Survey Management System**
  - Dynamic survey builder with drag-and-drop interface
  - Support for 7 question types (Single, Multi, Likert, NPS, Text, Long Text, Number)
  - Section-based survey organization
  - Survey activation/deactivation controls

- **Advanced Survey Features**
  - Conditional question display (show/hide based on answers)
  - Branching logic (skip to section or end survey)
  - Required field validation
  - Help text and tooltips

- **Response Collection**
  - Real-time response submission
  - Progress tracking for multi-section surveys
  - Auto-save functionality
  - Mobile-optimized survey interface

- **Analytics & Visualizations**
  - Interactive bar charts for choice-based questions
  - Doughnut charts for distribution visualization
  - Word clouds for text response analysis
  - Number histograms for numeric data
  - Real-time metrics (completion rate, avg time)
  - Question-level detailed analytics

- **Data Export**
  - CSV export for survey responses
  - CSV export for contact information
  - Bulk data download capability

- **Admin Dashboard**
  - Survey list with metadata
  - Quick survey creation
  - Response monitoring
  - Live results page with auto-refresh

- **Security Features**
  - Session-based authentication with Passport.js
  - PostgreSQL session store
  - Rate limiting on public endpoints
  - Input validation with Zod
  - CORS protection
  - Helmet security headers
  - SQL injection protection via Prisma ORM

- **User Experience**
  - Responsive design (mobile, tablet, desktop)
  - Accessibility features (WCAG 2.1 AA)
  - Loading states and error handling
  - Progress indicators
  - Smooth page transitions

- **Developer Experience**
  - TypeScript throughout
  - Hot module replacement (HMR)
  - Docker Compose setup
  - Comprehensive API documentation
  - Prisma database management
  - ESLint and Prettier configuration

- **Documentation**
  - Complete README with quick start
  - Architecture documentation
  - API reference guide
  - Development setup guide
  - Deployment instructions
  - User guide
  - Contributing guidelines

### Technical Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Chart.js, React Wordcloud
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Auth**: Passport.js with local strategy
- **Deployment**: Docker, Docker Compose
- **Testing**: Vitest, React Testing Library

### Infrastructure
- Multi-stage Docker build for optimized images
- PostgreSQL 15 with connection pooling
- Session store in database
- Health check endpoints
- Structured logging with Pino

---

## [Unreleased]

### Planned Features
- Multiple admin accounts with role-based access
- Survey templates library
- Custom branding/white-labeling
- Email notifications for new responses
- Scheduled survey activation/deactivation
- Response quotas and limits
- Survey duplication feature
- Question bank/library
- Advanced filtering on results page
- PDF export for results
- Multi-language support
- Dark mode
- Survey analytics dashboard
- Webhook integrations
- API rate limiting per user
- Two-factor authentication
- Audit log viewer in UI

### Refactor

- Consolidated error handling and authentication middleware in the API
  - Added `api/src/middleware/errorHandler.ts` (centralized AppError-aware handler)
  - Added `api/src/middleware/auth.ts` with `requireAuth` and `optionalAuth`
  - Replaced legacy `mixedAuth` usage and added tests for auth middleware
  - Fixed lint config to avoid ESLint ESM/CommonJS mismatch

### Known Issues
- Word cloud may not render well with very short texts
- Session persistence requires cookies enabled
- Export limited to CSV format
- No support for file uploads in surveys
- Mobile landscape mode could be optimized

---

## Version History

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major features
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, minor improvements

### Upgrade Path
When upgrading from older versions:
1. Backup database
2. Run database migrations: `npm run db:push`
3. Rebuild Docker containers: `docker-compose up -d --build`
4. Clear browser cache
5. Test admin and public interfaces

---

## Migration Notes

### From Development to Production
1. Set `NODE_ENV=production`
2. Use strong `SESSION_SECRET`
3. Enable HTTPS with reverse proxy
4. Configure proper `DATABASE_URL`
5. Change default admin password
6. Set up regular database backups
7. Configure monitoring and logging

---

## Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for how to contribute to this project.

---

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check documentation in `/docs`
- Review existing issues and discussions

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Acknowledgments

- Chart.js team for excellent visualization library
- Prisma team for outstanding ORM
- React team for the framework
- All open-source contributors and community members

---

*Last Updated: October 19, 2025*

### Refactor
- Centralized API error handling into `api/src/middleware/errorHandler.ts` to simplify `index.ts` and standardize AppError responses.
- Consolidated authentication middleware: added `api/src/middleware/auth.ts` with `requireAuth` and `optionalAuth`, and updated routes to use the unified middleware. Kept a backwards-compatible shim at `api/src/middleware/mixedAuth.ts`.

*Last Updated: October 23, 2025*
