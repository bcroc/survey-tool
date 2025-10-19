# 📡 API Reference

## Base URL
```
Development: http://localhost:3001/api
Production: [Your production URL]/api
```

## Authentication
Admin endpoints require session-based authentication. Use `/api/auth/login` to authenticate.

## Response Format
All endpoints return JSON in the following format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "meta": {
    "details": [ ... ] // For validation errors
  }
}
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/login
Login to admin dashboard.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "email": "admin@example.com"
  }
}
```

**Errors:**
- `401` - Invalid credentials

---

### POST /api/auth/logout
Logout from admin dashboard.

**Response (200):**
```json
{
  "success": true
}
```

---

### GET /api/auth/me
Check authentication status.

**Response (200):**
```json
{
  "authenticated": true,
  "user": {
    "id": "clx...",
    "email": "admin@example.com"
  }
}
```

---

## 📝 Public Survey Endpoints

### GET /api/surveys/active
Get the currently active survey.

**Query Parameters:**
- `eventSlug` (required) - Event identifier

**Response (200):**
```json
{
  "id": "clx...",
  "title": "Event Feedback Survey",
  "description": "...",
  "isActive": true,
  "sections": [
    {
      "id": "clx...",
      "title": "General Feedback",
      "order": 0,
      "questions": [
        {
          "id": "clx...",
          "type": "SINGLE",
          "prompt": "How was the event?",
          "helpText": "Please be honest",
          "required": true,
          "order": 0,
          "options": [
            {
              "id": "clx...",
              "label": "Excellent",
              "value": "excellent",
              "order": 0
            }
          ]
        }
      ]
    }
  ]
}
```

**Errors:**
- `400` - Missing eventSlug
- `404` - No active survey found

---

### GET /api/surveys/:id
Get specific survey by ID.

**Parameters:**
- `id` - Survey ID

**Response (200):**
Same as active survey endpoint.

**Errors:**
- `404` - Survey not found

---

## 📊 Submission Endpoints

### POST /api/submissions
Create a new survey submission.

**Request:**
```json
{
  "surveyId": "clx...",
  "eventSlug": "tech-conf-2024"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "submissionId": "uuid..."
  },
  "message": "Submission created successfully"
}
```

**Errors:**
- `400` - Validation error or survey not active
- `404` - Survey not found

---

### POST /api/submissions/:id/answers
Submit or update answers for a submission.

**Parameters:**
- `id` - Submission ID

**Request:**
```json
{
  "answers": [
    {
      "questionId": "clx...",
      "choiceValues": ["excellent"], // For SINGLE/MULTI
      "textValue": "Great event!", // For TEXT/LONGTEXT
      "numberValue": 9 // For LIKERT/NPS/NUMBER
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Answers saved successfully"
}
```

**Errors:**
- `400` - Validation error or submission already completed
- `404` - Submission not found

---

### POST /api/submissions/:id/complete
Mark a submission as complete.

**Parameters:**
- `id` - Submission ID

**Request:**
```json
{
  "completedAt": "2024-03-15T10:30:00Z" // Optional, defaults to now
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "nextRoute": "/contact"
  },
  "message": "Survey completed successfully"
}
```

**Errors:**
- `400` - Submission already completed
- `404` - Submission not found

---

## 📇 Contact Endpoints

### POST /api/contacts
Submit contact information (separate from survey responses).

**Request:**
```json
{
  "eventSlug": "tech-conf-2024",
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "role": "Developer",
  "consent": true
}
```

**Notes:**
- At least one contact field (name, email, company, or role) must be provided
- `consent` must be explicitly set
- No linkage to survey submissions (privacy-first design)

**Response (201):**
```json
{
  "success": true,
  "contactId": "clx...",
  "message": "Thank you! We'll be in touch soon."
}
```

**Errors:**
- `400` - Validation error or no contact fields provided

---

## 🔒 Admin - Survey Management

**All admin endpoints require authentication.**

### GET /api/admin/surveys
List all surveys.

**Response (200):**
```json
[
  {
    "id": "clx...",
    "title": "Event Feedback",
    "description": "...",
    "isActive": true,
    "createdAt": "2024-03-15T10:00:00Z",
    "updatedAt": "2024-03-15T10:00:00Z",
    "sections": [ ... ],
    "_count": {
      "submissions": 42
    }
  }
]
```

---

### GET /api/admin/surveys/:id
Get single survey with full details.

**Response (200):**
Full survey object with sections, questions, and options.

---

### POST /api/admin/surveys
Create a new survey.

**Request:**
```json
{
  "title": "New Survey",
  "description": "Survey description",
  "isActive": false
}
```

**Response (201):**
```json
{
  "id": "clx...",
  "title": "New Survey",
  "description": "Survey description",
  "isActive": false,
  "createdAt": "2024-03-15T10:00:00Z",
  "updatedAt": "2024-03-15T10:00:00Z"
}
```

---

### PATCH /api/admin/surveys/:id
Update an existing survey.

**Request:**
```json
{
  "title": "Updated Title",
  "isActive": true
}
```

**Response (200):**
Updated survey object.

---

### DELETE /api/admin/surveys/:id
Delete a survey (cascades to sections, questions, submissions).

**Response (200):**
```json
{
  "success": true
}
```

---

## 🗂️ Admin - Section Management

### POST /api/admin/sections
Create a new section within a survey.

**Request:**
```json
{
  "surveyId": "clx...",
  "title": "Section Title",
  "order": 0
}
```

---

### PATCH /api/admin/sections/:id
Update a section.

**Request:**
```json
{
  "title": "Updated Title",
  "order": 1
}
```

---

### DELETE /api/admin/sections/:id
Delete a section (cascades to questions).

---

## ❓ Admin - Question Management

### POST /api/admin/questions
Create a new question within a section.

**Request:**
```json
{
  "sectionId": "clx...",
  "type": "SINGLE",
  "prompt": "Question text?",
  "helpText": "Optional help text",
  "required": true,
  "order": 0,
  "options": [
    {
      "label": "Option 1",
      "value": "option1",
      "order": 0
    }
  ]
}
```

**Question Types:**
- `SINGLE` - Single choice (radio buttons)
- `MULTI` - Multiple choice (checkboxes)
- `LIKERT` - Likert scale 1-5
- `TEXT` - Short text input
- `LONGTEXT` - Long text (textarea)
- `NPS` - Net Promoter Score 0-10
- `NUMBER` - Numeric input

---

### PATCH /api/admin/questions/:id
Update a question.

---

### DELETE /api/admin/questions/:id
Delete a question (cascades to answers).

---

## 📈 Admin - Analytics Endpoints

### GET /api/admin/metrics/overview
Get overview analytics for a survey.

**Query Parameters:**
- `surveyId` (required) - Survey ID

**Response (200):**
```json
{
  "totalSubmissions": 150,
  "completedSubmissions": 142,
  "inProgressSubmissions": 8,
  "completionRate": 94.67,
  "averageTimeToComplete": 180, // seconds
  "submissionsByDate": [
    {
      "date": "2024-03-15",
      "count": 25
    }
  ]
}
```

---

### GET /api/admin/metrics/question/:id
Get analytics for a specific question.

**Response (200):**
```json
{
  "questionId": "clx...",
  "prompt": "How was the event?",
  "type": "SINGLE",
  "totalResponses": 142,
  "responses": [
    {
      "value": "excellent",
      "label": "Excellent",
      "count": 85,
      "percentage": 59.86
    }
  ],
  "textResponses": [ ... ], // For TEXT/LONGTEXT
  "numericalStats": { // For LIKERT/NPS/NUMBER
    "mean": 8.5,
    "median": 9,
    "mode": 9,
    "stdDev": 1.2
  }
}
```

---

## 📤 Admin - Export Endpoints

### GET /api/admin/export/responses.csv
Export all survey responses as CSV.

**Query Parameters:**
- `surveyId` (optional) - Filter by survey

**Response (200):**
CSV file download.

---

### GET /api/admin/export/contacts.csv
Export all contacts as CSV (separate from responses).

**Query Parameters:**
- `eventSlug` (optional) - Filter by event

**Response (200):**
CSV file download.

---

## 📋 Admin - Audit Log

### GET /api/admin/audit
Get audit log of admin actions.

**Query Parameters:**
- `limit` (optional) - Number of entries (default: 50)
- `offset` (optional) - Pagination offset
- `action` (optional) - Filter by action type

**Response (200):**
```json
{
  "logs": [
    {
      "id": "clx...",
      "adminId": "clx...",
      "action": "CREATE_SURVEY",
      "entity": "Survey",
      "entityId": "clx...",
      "meta": { ... },
      "createdAt": "2024-03-15T10:00:00Z",
      "admin": {
        "email": "admin@example.com"
      }
    }
  ],
  "total": 250
}
```

---

## 🚨 Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Validation error or invalid state |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Something went wrong |

---

## 🔄 Rate Limiting

**Public Endpoints:**
- 100 requests per 15 minutes per IP

**Submission Endpoints:**
- 10 submissions per hour per IP

**Admin Endpoints:**
- No rate limiting (session-based auth)

---

## 🔒 Privacy & Security

1. **No Linkage:** Contact information is stored separately from survey responses
2. **Anonymous Submissions:** Submissions use UUID, not linked to users
3. **Audit Logging:** All admin actions are logged
4. **Session Security:** HttpOnly, Secure cookies in production
5. **Rate Limiting:** Protection against abuse
6. **Input Validation:** All inputs validated with Zod schemas
7. **SQL Injection Protection:** Prisma ORM prevents SQL injection
8. **XSS Protection:** Helmet middleware adds security headers

---

## 🧪 Testing

Example using curl:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -c cookies.txt

# Get active survey
curl http://localhost:3001/api/surveys/active?eventSlug=demo

# Create submission
curl -X POST http://localhost:3001/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"surveyId":"clx...","eventSlug":"demo"}'

# Get surveys (admin)
curl http://localhost:3001/api/admin/surveys \
  -b cookies.txt
```

---

## 📚 Additional Resources

- [Project Summary](./PROJECT_SUMMARY.md)
- [Setup Instructions](./SETUP.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Privacy Policy](./PRIVACY.md)
