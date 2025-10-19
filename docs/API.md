# API Reference

Complete API documentation for the Event Survey Application.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "stack": "Stack trace (development only)"
}
```

## Authentication

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "email": "admin@example.com"
    }
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

---

### POST /api/auth/logout
Logout current user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "loggedOut": true
  }
}
```

---

### GET /api/auth/me
Check authentication status.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "email": "admin@example.com"
    }
  }
}
```

---

## Public Survey Endpoints

### GET /api/surveys/active
Get the currently active survey for an event.

**Query Parameters:**
- `eventSlug` (required): Event identifier (e.g., "fall-summit-2025")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "survey123",
    "title": "Event Feedback Survey",
    "description": "Help us improve",
    "isActive": true,
    "sections": [
      {
        "id": "section123",
        "title": "Overall Experience",
        "order": 1,
        "questions": [
          {
            "id": "question123",
            "type": "LIKERT",
            "prompt": "How would you rate the event?",
            "helpText": "1 = Poor, 5 = Excellent",
            "required": true,
            "order": 1,
            "showIf": null,
            "options": []
          }
        ]
      }
    ]
  }
}
```

**Question Types:**
- `SINGLE` - Single choice (radio buttons)
- `MULTI` - Multiple choice (checkboxes)
- `LIKERT` - Likert scale (1-5)
- `NPS` - Net Promoter Score (0-10)
- `TEXT` - Short text input
- `LONGTEXT` - Long text input
- `NUMBER` - Numeric input

**Errors:**
- `404 Not Found` - No active survey found

---

### GET /api/surveys/:id
Get a specific survey by ID.

**Response:** Same as `/api/surveys/active`

---

## Submission Endpoints

### POST /api/submissions
Create a new submission for a survey.

**Request Body:**
```json
{
  "surveyId": "survey123",
  "eventSlug": "fall-summit-2025"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "submissionId": "submission123"
  }
}
```

---

### POST /api/submissions/:id/answers
Submit or update answers for a submission.

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "question123",
      "numberValue": 5
    },
    {
      "questionId": "question456",
      "choiceValues": ["option1", "option2"]
    },
    {
      "questionId": "question789",
      "textValue": "Great event!"
    }
  ]
}
```

**Answer Types:**
- `choiceValues`: Array of strings for SINGLE/MULTI questions
- `numberValue`: Number for LIKERT/NPS/NUMBER questions
- `textValue`: String for TEXT/LONGTEXT questions

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Answers saved successfully"
}
```

---

### POST /api/submissions/:id/complete
Mark a submission as complete.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "completedAt": "2025-10-19T03:45:00.000Z"
  }
}
```

---

## Contact Endpoints

### POST /api/contacts
Submit contact information.

**Request Body:**
```json
{
  "eventSlug": "fall-summit-2025",
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "role": "Developer",
  "consent": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "contact123"
  }
}
```

---

## Admin Endpoints

All admin endpoints require authentication. Include session cookie in requests.

### Surveys

#### GET /api/admin/surveys
List all surveys with metadata.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "survey123",
      "title": "Event Feedback",
      "description": "Help us improve",
      "isActive": true,
      "createdAt": "2025-10-19T00:00:00.000Z",
      "updatedAt": "2025-10-19T00:00:00.000Z",
      "sections": [...],
      "_count": {
        "submissions": 42
      }
    }
  ]
}
```

---

#### GET /api/admin/surveys/:id
Get a specific survey with all details.

**Response:** Same structure as public survey endpoint

---

#### POST /api/admin/surveys
Create a new survey.

**Request Body:**
```json
{
  "title": "New Survey",
  "description": "Survey description",
  "isActive": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "survey123",
    "title": "New Survey",
    "description": "Survey description",
    "isActive": false,
    "createdAt": "2025-10-19T03:45:00.000Z",
    "updatedAt": "2025-10-19T03:45:00.000Z"
  }
}
```

---

#### PATCH /api/admin/surveys/:id
Update an existing survey.

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "survey123",
    "title": "Updated Title",
    ...
  }
}
```

---

#### DELETE /api/admin/surveys/:id
Delete a survey and all related data.

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Survey deleted successfully"
}
```

---

### Sections

#### POST /api/admin/sections
Create a new section in a survey.

**Request Body:**
```json
{
  "surveyId": "survey123",
  "title": "Section Title",
  "order": 1
}
```

---

#### PATCH /api/admin/sections/:id
Update a section.

**Request Body (all optional):**
```json
{
  "title": "Updated Title",
  "order": 2
}
```

---

#### DELETE /api/admin/sections/:id
Delete a section and all its questions.

---

### Questions

#### POST /api/admin/questions
Create a new question in a section.

**Request Body:**
```json
{
  "sectionId": "section123",
  "type": "LIKERT",
  "prompt": "How satisfied are you?",
  "helpText": "Optional help text",
  "required": true,
  "order": 1,
  "showIf": "{\"questionId\":\"q1\",\"operator\":\"equals\",\"value\":\"yes\"}"
}
```

**ShowIf Operators:**
- `equals` - Exact match
- `not_equals` - Not equal to
- `contains` - Contains substring
- `greater_than` - Numeric comparison
- `less_than` - Numeric comparison

---

#### PATCH /api/admin/questions/:id
Update a question.

---

#### DELETE /api/admin/questions/:id
Delete a question and all its options.

---

### Options

#### POST /api/admin/options
Create an option for a question.

**Request Body:**
```json
{
  "questionId": "question123",
  "label": "Excellent",
  "value": "excellent",
  "order": 1
}
```

---

#### PATCH /api/admin/options/:id
Update an option.

---

#### DELETE /api/admin/options/:id
Delete an option.

---

### Branching

Branching is now managed on the `Option` resource. Instead of a separate `branching-rules` resource, update the option with the branching fields.

#### PATCH /api/admin/options/:id
Update an option's branching behavior.

**Request Body (example):**
```json
{
  "branchAction": "SKIP_TO_SECTION",
  "targetSectionId": "section456",
  "skipToEnd": false
}
```

Fields:
- `branchAction` - One of `SHOW_QUESTION`, `SKIP_TO_SECTION`, `SKIP_TO_END`.
- `targetQuestionId` - Optional, required when `branchAction` is `SHOW_QUESTION`.
- `targetSectionId` - Optional, required when `branchAction` is `SKIP_TO_SECTION`.
- `skipToEnd` - Optional boolean, shorthand to end the survey.

To remove branching from an option, PATCH with `branchAction: null` and `skipToEnd: false`.

---

### Analytics

#### GET /api/admin/metrics/overview
Get survey overview metrics.

**Query Parameters:**
- `surveyId` (required): Survey ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalSubmissions": 100,
    "completedSubmissions": 85,
    "completionRate": 85,
    "avgCompletionTimeSeconds": 180
  }
}
```

---

#### GET /api/admin/metrics/question/:id
Get detailed metrics for a specific question.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "questionId": "question123",
    "questionType": "LIKERT",
    "totalResponses": 85,
    "distribution": {
      "1": 5,
      "2": 10,
      "3": 20,
      "4": 30,
      "5": 20
    },
    "average": 3.6,
    "median": 4,
    "min": 1,
    "max": 5
  }
}
```

For text questions:
```json
{
  "questionId": "question456",
  "questionType": "TEXT",
  "totalResponses": 85,
  "responses": ["Great event!", "Very informative", ...],
  "wordCount": 425
}
```

---

### Export

#### GET /api/admin/export/responses.csv
Export survey responses as CSV.

**Query Parameters:**
- `surveyId` (optional): Specific survey or all surveys

**Response:** CSV file download

---

#### GET /api/admin/export/contacts.csv
Export contacts as CSV.

**Query Parameters:**
- `eventSlug` (optional): Specific event or all events

**Response:** CSV file download

---

### Audit Log

#### GET /api/admin/audit
Get audit log entries.

**Query Parameters:**
- `limit` (optional): Number of entries (default: 100)
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "audit123",
      "adminId": "admin123",
      "action": "create",
      "entity": "Survey",
      "entityId": "survey123",
      "meta": { "title": "New Survey" },
      "timestamp": "2025-10-19T03:45:00.000Z"
    }
  ]
}
```

---

## Rate Limiting

- **Public routes**: 100 requests per 15 minutes per IP
- **Submission routes**: 10 requests per hour per IP
- **Admin routes**: No limit (authenticated users only)

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1760845621
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Authentication required |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

---

## Common Error Examples

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed: title is required"
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### Rate Limit Error
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```
