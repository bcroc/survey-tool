# Release Checklist

This checklist ensures production readiness for each release.

## Pre-Release (1-2 weeks before)

### Code Quality
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Code coverage meets minimum threshold (80%)
- [ ] All PRs reviewed and approved
- [ ] No open critical/high-severity security issues

### Documentation
- [ ] CHANGELOG.md updated with new features/fixes/breaking changes
- [ ] README.md updated if features/setup changed
- [ ] API documentation reflects current endpoints
- [ ] Database migration instructions documented (if applicable)
- [ ] Known limitations documented

### Dependencies
- [ ] All dependencies up-to-date: `npm update`
- [ ] Security audit passes: `npm audit --audit-level=moderate`
- [ ] Lock files committed

### Performance
- [ ] Frontend bundle size is optimized (< 500KB gzipped)
- [ ] API response times acceptable (< 200ms for most endpoints)
- [ ] Database queries optimized (no N+1 queries)
- [ ] Caching headers configured properly

---

## Release Day

### Before Deployment
- [ ] Create release branch: `git checkout -b release/v1.x.x`
- [ ] Update version numbers in package.json files
- [ ] Update CHANGELOG.md with release date
- [ ] Commit: `git commit -m "Release v1.x.x"`
- [ ] Create Git tag: `git tag -a v1.x.x -m "Release version 1.x.x"`
- [ ] Push branch and tag: `git push origin release/v1.x.x && git push origin v1.x.x`

### Build & Test Docker Images
- [ ] Build and test locally: `docker-compose -f docker-compose.prod.yml build`
- [ ] Test locally: `docker-compose -f docker-compose.prod.yml up`
- [ ] Run health checks against containers
- [ ] Verify database migrations run: `docker-compose -f docker-compose.prod.yml exec api npm run db:migrate`

### Deployment to Staging
- [ ] Deploy to staging environment
- [ ] Run full integration test suite against staging
- [ ] Verify all external API integrations work
- [ ] Test email notifications (if applicable)
- [ ] Check database connectivity and performance
- [ ] Verify logging and monitoring work

### Final Pre-Production Checks
- [ ] Backup production database
- [ ] Review environment variables are correct
- [ ] Verify all secrets are properly configured
- [ ] Check disk space and resource availability
- [ ] Review firewall rules and security groups

---

## Production Deployment

### Deployment Process
- [ ] Schedule maintenance window (if needed)
- [ ] Announce downtime to users (if applicable)
- [ ] Stop current containers: `docker-compose -f docker-compose.prod.yml down`
- [ ] Pull latest code: `git pull origin main && git checkout v1.x.x`
- [ ] Build new images: `docker-compose -f docker-compose.prod.yml build`
- [ ] Start new containers: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Run migrations: `docker-compose -f docker-compose.prod.yml exec api npm run db:migrate`

### Post-Deployment Verification
- [ ] Verify all containers are running: `docker-compose -f docker-compose.prod.yml ps`
- [ ] Check logs for errors: `docker-compose -f docker-compose.prod.yml logs`
- [ ] Verify API health endpoint: `curl https://your-domain.com/health`
- [ ] Test critical user flows end-to-end
- [ ] Verify database is accessible
- [ ] Check monitoring dashboards

### Rollback Plan (if issues occur)
- [ ] Stop current containers
- [ ] Checkout previous release: `git checkout v1.x.x-1`
- [ ] Rebuild and restart: `docker-compose -f docker-compose.prod.yml up -d --build`
- [ ] Verify rollback successful
- [ ] Document what went wrong

---

## Post-Release (1-2 days after)

### Monitoring
- [ ] Monitor error logs for new issues
- [ ] Check performance metrics
- [ ] Verify no spike in resource usage
- [ ] Monitor error tracking system
- [ ] Review user feedback/issue reports

### Communication
- [ ] Announce release to stakeholders
- [ ] Update status page
- [ ] Send release notes to users (if applicable)
- [ ] Close release ticket

### Follow-Up
- [ ] Create tickets for any issues discovered
- [ ] Plan hotfix if critical issues found
- [ ] Update team on release status
- [ ] Archive release branch (after merge to main)

---

## Environment Checklist

### Production Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001` (or appropriate port)
- [ ] `DATABASE_URL` - uses strong credentials
- [ ] `SESSION_SECRET` - 32+ random characters
- [ ] `JWT_SECRET` - 32+ random characters
- [ ] `FRONTEND_URL` - correct origin for CORS
- [ ] Any third-party API keys configured

### Database
- [ ] PostgreSQL 15+ running
- [ ] Automated backups enabled
- [ ] Backup retention set (7+ days)
- [ ] Connection pooling configured
- [ ] Read replicas configured (if applicable)

### Infrastructure
- [ ] SSL/TLS certificate valid and not expiring soon
- [ ] Firewall rules in place
- [ ] Rate limiting enabled
- [ ] DDoS protection enabled
- [ ] CDN configured (if applicable)

### Monitoring & Logging
- [ ] Error tracking configured (Sentry/equivalent)
- [ ] Log aggregation configured (ELK/CloudWatch/equivalent)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring enabled
- [ ] Alerts configured for critical metrics

---

## Rollback Decision Tree

**When to rollback:**
- Critical security vulnerability discovered
- Data corruption or loss
- API completely unavailable (> 5 min downtime)
- Database migration failures
- Performance degradation (> 50% slower)

**When NOT to rollback:**
- Non-critical bugs (can be hotfixed forward)
- Minor performance issues (< 20% impact)
- Cosmetic UI issues
- Documentation errors

---

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Example: `v1.2.3`
