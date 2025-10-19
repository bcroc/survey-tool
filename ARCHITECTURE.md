# Event Survey Web App - Architecture & Privacy Documentation

## 🏗️ Simplified System Architecture

### 2-Container Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
│  (Attendees & Administrators)                               │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS (port 3001)
                  │
┌─────────────────▼───────────────────────────────────────────┐
│          CONTAINER 1: Unified Application                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Frontend (React SPA) - Static Files                 │  │
│  │  Served at: / (all non-API routes)                   │  │
│  │  ┌──────────────────────┐  ┌─────────────────────┐  │  │
│  │  │  Public Routes       │  │  Admin Routes       │  │  │
│  │  │  - Landing           │  │  - Login            │  │  │
│  │  │  - Survey Flow       │  │  - Dashboard        │  │  │
│  │  │  - Contact Form      │  │  - Survey Builder   │  │  │
│  │  │  - Thank You         │  │  - Results          │  │  │
│  │  └──────────────────────┘  └─────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Backend API (Express + Node.js)                     │  │
│  │  Served at: /api/*                                   │  │
│  │                                                       │  │
│  │  Middleware:                                         │  │
│  │  - express.static (serves frontend)                  │  │
│  │  - Rate Limiting                                     │  │
│  │  - Session Management (connect-pg-simple)            │  │
│  │  - CORS                                              │  │
│  │  - Helmet (Security Headers)                         │  │
│  │  - Zod Validation                                    │  │
│  │  - Passport Authentication                           │  │
│  │                                                       │  │
│  │  Routes:                                             │  │
│  │  - /api/surveys (public)                            │  │
│  │  - /api/submissions (public, rate-limited)          │  │
│  │  - /api/contacts (public, rate-limited)             │  │
│  │  - /api/auth (login/logout)                         │  │
│  │  - /api/admin/* (protected, CRUD + analytics)       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────────┘
                  │ Prisma ORM (PostgreSQL connection)
                  │
┌─────────────────▼───────────────────────────────────────────┐
│          CONTAINER 2: PostgreSQL Database                    │
│                                                              │
│  ┌──────────────────────┐    ┌─────────────────────────┐  │
│  │  Survey Definition   │    │  Privacy-Separated      │  │
│  │  - Survey            │    │  - Submission (anon)    │  │
│  │  - Section           │    │  - Answer (anon)        │  │
│  │  - Question          │    │  - Contact (separate)   │  │
│  │  - Option            │    │                         │  │
│  │                      │    │  NO FOREIGN KEYS ←→     │  │
│  │  Admin               │    │                         │  │
│  │  - AdminUser         │    │  Only eventSlug shared  │  │
│  │  - AuditLog          │    │  (non-linkable)         │  │
│  │  - Session           │    │                         │  │
│  └──────────────────────┘    └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Why 2 Containers?

**✅ Benefits of this simplified architecture:**

1. **Simplicity**: Only 2 services to manage instead of 3
2. **Single Endpoint**: Everything accessible at `localhost:3001`
3. **Easier Deployment**: One application container to deploy
4. **Reduced Complexity**: No need for nginx, proxy configuration, or CORS complexity
5. **Better Development**: Fewer moving parts = easier debugging
6. **Cost Effective**: Fewer resources needed in production
7. **Database Isolation**: PostgreSQL still separate for data persistence and backups

**Why keep PostgreSQL separate?**
- Data persistence and backups
- Easy to scale database independently
- Can connect external tools (pgAdmin, etc.)
- Industry best practice for stateful services

## 🔒 Privacy Architecture

### Core Principle: Complete Data Separation

The application implements a **"privacy by design"** approach where survey responses and contact information are architecturally separated:

#### 1. Database Schema Separation

**Submission/Answer Tables (Anonymous)**
```sql
submission:
  - id (UUID) ← Random, unlinked identifier
  - surveyId
  - eventSlug ← Only shared field (non-linkable)
  - createdAt
  - completedAt

answer:
  - id
  - submissionId → Links to submission
  - questionId → Links to question
  - choiceValues / textValue / numberValue
  - NO contact information
```

**Contact Table (Separate)**
```sql
contact:
  - id (CUID) ← Different ID type, unrelated
  - eventSlug ← Only shared field (non-linkable)
  - name, email, company, role
  - consent
  - createdAt
  - NO submissionId
  - NO answerId
  - NO foreign keys to submissions
```

#### 2. API Separation

**Public Submission Flow:**
```
POST /api/submissions
  → Creates submission with random UUID
  → Returns { submissionId }

POST /api/submissions/:id/answers
  → Stores answers linked to submission
  → No contact fields accepted

POST /api/submissions/:id/complete
  → Marks submission complete
  → Returns next route (/contact)
```

**Public Contact Flow:**
```
POST /api/contacts
  → Accepts: eventSlug, name, email, company, role, consent
  → REJECTS: submissionId, responseId, answerId
  → Zod schema validation enforces separation
  → Stores in separate table
```

#### 3. Export Separation

**Responses Export:**
```csv
submission_id, event_slug, created_at, completed_at, question_answers...
uuid-123, event-2025, 2025-10-17T..., 2025-10-17T..., "5", "Great!"
```
- Contains: Anonymous responses
- Excludes: Name, email, company, role, any contact info

**Contacts Export:**
```csv
contact_id, event_slug, name, email, company, role, consent, created_at
cuid-abc, event-2025, John Doe, john@ex.com, Acme, Dev, true, 2025-10-17T...
```
- Contains: Contact details
- Excludes: submission_id, answer_id, any response data

#### 4. Technical Guarantees

**Database Level:**
- ✅ No foreign key constraints between Contact ↔ Submission
- ✅ No foreign key constraints between Contact ↔ Answer
- ✅ Different primary key types (UUID vs CUID)
- ✅ Separate table storage

**API Level:**
- ✅ Zod schema explicitly rejects linkage fields with `z.never()`
- ✅ Strict mode validation prevents unknown fields
- ✅ Separate route handlers
- ✅ No join queries allowed

**Application Level:**
- ✅ Unit tests verify schema separation
- ✅ API tests verify rejection of linkage attempts
- ✅ Export tests verify no cross-identifiers

#### 5. The Role of `eventSlug`

`eventSlug` is the ONLY shared field:
- **Purpose**: Scoping data to events
- **Why it's safe**: Multiple submissions per event
- **Example**: `"fall-summit-2025"`
- **Cannot be used to link**: 100+ submissions share the same slug
- **Non-personally-identifiable**: Just an event name

### Privacy Flow Diagram

```
Attendee Journey:
┌──────────────┐
│ 1. Landing   │
│    Page      │
└──────┬───────┘
       │
       │ Click "Start Survey"
       │
┌──────▼───────┐
│ 2. Privacy   │
│    Policy    │ ← Clear explanation of separation
└──────┬───────┘
       │
       │ Accept & Start
       │
┌──────▼───────┐
│ 3. Survey    │
│    Questions │ ← Anonymous, UUID-based submission
└──────┬───────┘
       │
       │ Submit Answers
       │
┌──────▼───────┐
│ 4. Contact   │
│    Form      │ ← SEPARATE, optional, new table
│ (Optional)   │ ← "Your contact ≠ your answers"
└──────┬───────┘
       │
       │ Skip or Submit
       │
┌──────▼───────┐
│ 5. Thank You │
└──────────────┘

Data Flow:
┌─────────────────┐     ┌─────────────────┐
│   Submission    │     │    Contact      │
│   (Table 1)     │     │   (Table 2)     │
├─────────────────┤     ├─────────────────┤
│ id: uuid-123    │  ✗  │ id: cuid-abc    │
│ eventSlug: evt  │  →  │ eventSlug: evt  │ ← Only link
│ answers: [...]  │  ✗  │ email: john@... │
│ createdAt       │     │ name: John      │
└─────────────────┘     └─────────────────┘
        ↑
        │ No foreign key, no join possible
        │
```

## 📊 Data Flow Examples

### Example 1: Attendee Completes Survey with Contact

**Step 1:** Start survey
```http
POST /api/submissions
Body: { surveyId: "survey-123", eventSlug: "fall-summit-2025" }

Response: { submissionId: "a1b2c3d4-..." }  ← Random UUID
```

**Step 2:** Answer questions
```http
POST /api/submissions/a1b2c3d4-.../answers
Body: {
  answers: [
    { questionId: "q1", numberValue: 5 },
    { questionId: "q2", textValue: "Great event!" }
  ]
}

Response: { success: true }
```

**Step 3:** Complete survey
```http
POST /api/submissions/a1b2c3d4-.../complete

Response: { success: true, nextRoute: "/contact" }
```

**Step 4:** (Optional) Submit contact
```http
POST /api/contacts
Body: {
  eventSlug: "fall-summit-2025",  ← Same event
  name: "Jane Doe",
  email: "jane@example.com",
  consent: true
  // NO submissionId!  ← Rejected by schema
}

Response: { success: true, contactId: "xyz789" }  ← Different ID
```

**Result in Database:**

Submission table:
```
id              | eventSlug          | createdAt
a1b2c3d4-...    | fall-summit-2025  | 2025-10-17T10:30:00
```

Answer table:
```
submissionId    | questionId | numberValue | textValue
a1b2c3d4-...    | q1        | 5           | null
a1b2c3d4-...    | q2        | null        | "Great event!"
```

Contact table:
```
id     | eventSlug          | name     | email
xyz789 | fall-summit-2025  | Jane Doe | jane@example.com
```

**No way to link:** 
- Different IDs (UUID vs CUID)
- No foreign keys
- 100+ other submissions share same eventSlug
- Export files are completely separate

### Example 2: Attempting to Link (Blocked)

```http
POST /api/contacts
Body: {
  eventSlug: "fall-summit-2025",
  email: "hacker@evil.com",
  submissionId: "a1b2c3d4-..."  ← Trying to link!
}

Response: 400 Bad Request
{
  error: "Validation failed",
  details: [
    {
      path: "submissionId",
      message: "Invalid"  ← Rejected by z.never()
    }
  ]
}
```

## 🧪 Testing Privacy

Run privacy tests:
```bash
cd api
npm test -- privacy.test.ts
```

Tests verify:
1. ✅ No TypeScript types allow joins
2. ✅ No Prisma relations exist
3. ✅ API rejects linkage fields
4. ✅ Exports maintain separation

## 🔐 Security Measures

### Authentication
- Session-based auth with httpOnly cookies
- Passport.js local strategy
- Bcrypt password hashing (10 rounds)
- CSRF protection (optional, can be enabled)

### Rate Limiting
- Public endpoints: 100 requests / 15 min per IP
- Submissions: 10 / hour per IP
- Prevents abuse and DoS

### Input Validation
- Zod schemas for all endpoints
- Type-safe validation
- Prevents injection attacks

### CORS
- Locked to FRONTEND_URL origin
- Credentials enabled
- Prevents unauthorized access

### Security Headers (Helmet)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- CSP (configurable)

### Structured Logging (Pino)
- No PII in logs
- Redacts: passwords, emails, cookies
- JSON formatted for monitoring tools

## 📈 Scalability Considerations

### Database
- Indexed fields: surveyId, eventSlug, createdAt
- Connection pooling via Prisma
- Can be sharded by eventSlug if needed

### API
- Stateless (sessions in DB)
- Horizontal scaling ready
- Load balancer compatible

### Frontend
- Static assets (CDN-ready)
- Code splitting
- PWA caching

## 🎯 WCAG AA Compliance

### Implemented
- ✅ Semantic HTML (headings, labels, landmarks)
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ ARIA labels where needed
- ✅ Color contrast (TailwindCSS defaults)
- ✅ Large tap targets (44x44px minimum)

### To Test
- Screen reader compatibility
- High contrast mode
- Zoom to 200%
- Keyboard-only navigation

## 📝 Audit Trail

All admin actions are logged:
```sql
audit_log:
  - action: "CREATE_SURVEY" | "UPDATE_SURVEY" | "DELETE_SURVEY" |
            "EXPORT_RESPONSES" | "EXPORT_CONTACTS" | "LOGIN"
  - adminId: Who did it
  - entity: What was affected
  - entityId: Specific record
  - meta: JSON details
  - createdAt: When
```

Query audit logs:
```http
GET /api/admin/audit?limit=100&offset=0
```

## 🚀 Deployment Checklist

Before going live:

### Environment
- [ ] Set strong SESSION_SECRET
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL to production domain
- [ ] Change admin password
- [ ] Configure CORS for production domain

### Database
- [ ] Setup automated backups
- [ ] Configure connection pooling
- [ ] Enable SSL for database connections
- [ ] Review indexes for performance

### Security
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Set cookie.secure = true
- [ ] Enable CSRF protection
- [ ] Review rate limits
- [ ] Setup monitoring/alerting
- [ ] Configure log aggregation

### Privacy
- [ ] Review and customize PRIVACY.md
- [ ] Run privacy tests in production
- [ ] Verify export separation
- [ ] Document data retention policy

### Performance
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Setup caching headers
- [ ] Monitor database query performance

## 📞 Support

For questions about architecture or privacy:
- Review this document
- Check SETUP.md for implementation details
- Review Prisma schema comments
- Check API route comments
