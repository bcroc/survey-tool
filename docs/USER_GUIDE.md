# User Guide

Complete guide for using the Event Survey Application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Admin Dashboard](#admin-dashboard)
3. [Creating Surveys](#creating-surveys)
4. [Managing Questions](#managing-questions)
5. [Viewing Results](#viewing-results)
6. [Exporting Data](#exporting-data)
7. [Public Survey Experience](#public-survey-experience)

---

## Getting Started

### Accessing the Application

**Public Survey:**
- Navigate to `https://yourdomain.com` or `http://localhost:3001`
- Click "Take Survey" or go directly to `/survey/:surveyId`

**Admin Dashboard:**
- Navigate to `/admin/login`
- Enter admin credentials
- Default: `admin@example.com` / `admin123` (change this!)

### First Time Setup

1. Login to admin dashboard
2. Change default password in Settings
3. Create your first survey
4. Add sections and questions
5. Activate survey
6. Share survey link with participants

---

## Admin Dashboard

### Overview

The dashboard shows:
- **Active Surveys** - Currently accepting responses
- **Total Responses** - Across all surveys
- **Quick Actions** - Create survey, view results, manage surveys

### Navigation

- **Dashboard** (`/admin`) - Overview and quick access
- **Surveys** (`/admin/surveys`) - Manage all surveys
- **Results** (`/admin/results/:id`) - View analytics
- **Live** (`/admin/live/:id`) - Real-time response monitoring
- **Settings** (`/admin/settings`) - Account settings

---

## Creating Surveys

### Step 1: Create Survey

1. Go to **Surveys** page
2. Click **Create Survey** button
3. Fill in details:
   - **Title** - Survey name (e.g., "Event Feedback 2025")
   - **Description** - Brief description for participants
   - **Active** - Toggle to make survey live
4. Click **Create**

### Step 2: Add Sections

Sections help organize questions into logical groups.

1. Click **Add Section**
2. Enter **Section Title** (e.g., "Overall Experience")
3. Set **Order** number (sections display in order)
4. Click **Save**

### Step 3: Add Questions

1. Select a section
2. Click **Add Question**
3. Choose **Question Type**:
   - **Single Choice** - Radio buttons (one answer)
   - **Multiple Choice** - Checkboxes (multiple answers)
   - **Likert Scale** - 1-5 rating scale
   - **Net Promoter Score** - 0-10 rating
   - **Text** - Short text input
   - **Long Text** - Multi-line text area
   - **Number** - Numeric input

4. Enter **Question Text**
5. Add **Help Text** (optional)
6. Mark as **Required** if needed
7. Set **Order** within section
8. Click **Save**

### Step 4: Add Options (for choice questions)

For Single/Multiple Choice questions:

1. Click **Add Option**
2. Enter **Label** (what users see)
3. Enter **Value** (internal identifier)
4. Set **Order**
5. Repeat for all options
6. Click **Save**

---

## Managing Questions

### Question Types Explained

#### Single Choice
- One answer only
- Use for: "What's your role?", "Which session did you attend?"
- Displays as radio buttons

#### Multiple Choice
- Multiple answers allowed
- Use for: "Which topics interest you?" (select all that apply)
- Displays as checkboxes

#### Likert Scale
- 1-5 rating scale
- Use for: "Rate the venue", "How satisfied were you?"
- Displays as radio buttons with numeric labels

#### Net Promoter Score (NPS)
- 0-10 rating scale
- Use for: "How likely are you to recommend this event?"
- Standard NPS question format

#### Text Input
- Short text answer
- Use for: "What's your company name?", "One-word description"
- Single line input

#### Long Text
- Multi-line text
- Use for: "What could we improve?", "Additional comments"
- Text area

#### Number
- Numeric input only
- Use for: "How many years of experience?", "Number of employees"
- Number field with validation

### Conditional Logic

Show/hide questions based on previous answers.

**Example:** Only ask "Which workshop was best?" if they selected "Workshops" as favorite.

1. Edit the dependent question
2. Click **Add Condition**
3. Select:
   - **Question** - The question to check
   - **Operator** - equals, not_equals, contains, etc.
   - **Value** - The value to match
4. Save

**Available Operators:**
- `equals` - Exact match
- `not_equals` - Not equal to
- `contains` - Text contains substring
- `greater_than` - Number is greater
- `less_than` - Number is less

### Branching Rules

Skip to different sections or end survey based on answers.

**Example:** If user rates event 1-2, skip to "What went wrong?" section.

1. Edit the option (e.g., "Poor" rating)
2. Click **Add Branching Rule**
3. Choose action:
   - **Skip to Section** - Jump to specific section
   - **Skip to End** - End survey immediately
4. Select target section (if applicable)
5. Save

---

## Viewing Results

### Overview Metrics

The results page shows:
- **Total Submissions** - All started surveys
- **Completed Submissions** - Fully completed surveys
- **Completion Rate** - Percentage who finished
- **Average Time** - Time to complete survey

### Question Analysis

Select any question to view detailed analytics:

#### Choice Questions (Single/Multi/Likert/NPS)

**Visualizations:**
- **Bar Chart** - Response distribution
- **Doughnut Chart** - Percentage breakdown
- **Statistics** - Average, median, min, max

**Example:**
```
Question: "How would you rate the event?"

Bar Chart:
5 stars: ████████████████████ 40
4 stars: ███████████████ 30
3 stars: ████████ 15
2 stars: ████ 10
1 star:  █ 5

Average: 3.8/5
Median: 4
```

#### Text Questions (Text/Long Text)

**Visualizations:**
- **Word Cloud** - Most frequently used words (larger = more common)
- **Top Keywords** - List of common words with counts
- **Sample Responses** - Actual text responses
- **Statistics** - Total responses, word count, average words

**Word Cloud Example:**
```
         amazing
    great      excellent
venue    WONDERFUL    helpful
    informative  valuable
        useful  interesting
```

Stop words (the, and, it, etc.) are automatically filtered out.

#### Number Questions

**Visualizations:**
- **Histogram** - Distribution across value ranges
- **Statistics** - Average, median, min, max, total responses

### Live Monitoring

Go to **Live** page during event:
- Real-time response count
- Live completion metrics
- Updates every 30 seconds
- See responses as they come in

---

## Exporting Data

### Export Survey Responses

1. Go to Results page
2. Click **Export Responses** button
3. Choose format: CSV
4. Download file

**CSV Format:**
```csv
submission_id,completed_at,question_1,question_2,question_3
sub_123,2025-10-19T10:30:00Z,5,Excellent,Very informative
sub_124,2025-10-19T10:35:00Z,4,Good,Could improve logistics
```

### Export Contacts

If using contact collection:

1. Go to Dashboard
2. Click **Export Contacts**
3. Download CSV

**CSV Format:**
```csv
name,email,company,role,event_slug,created_at
John Doe,john@example.com,Acme Corp,Developer,fall-summit-2025,2025-10-19T10:00:00Z
```

### Working with Exported Data

**In Excel/Sheets:**
1. Open file in Excel or Google Sheets
2. Use pivot tables for analysis
3. Create custom charts

**In Python/R:**
```python
import pandas as pd
df = pd.read_csv('responses.csv')
df.describe()  # Statistical summary
df.groupby('question_1').size()  # Count by response
```

---

## Public Survey Experience

### Taking a Survey

1. **Access Survey**
   - Click survey link or QR code
   - Goes to `/survey/:surveyId`

2. **Progress Through Sections**
   - Complete all required questions
   - Click **Next** to advance
   - Click **Previous** to go back

3. **Submit**
   - Review answers (if enabled)
   - Click **Submit Survey**
   - See thank you message

### Survey Features

**Progress Indicator:**
- Shows current section number
- E.g., "Section 2 of 4"

**Required Fields:**
- Marked with red asterisk (*)
- Cannot proceed without answering

**Help Text:**
- Gray text below question
- Provides additional context

**Skip Logic:**
- Questions may appear/hide based on answers
- Sections may be skipped based on rules

**Save Progress:**
- Answers saved as you go
- Can close and resume later (if enabled)

### Contact Form

After completing survey:
1. Optional contact information form
2. Enter name, email, company, role
3. Check consent checkbox
4. Submit

This helps organizers follow up with participants.

---

## Best Practices

### Survey Design

1. **Keep it Short**
   - 5-10 minutes max
   - 15-25 questions ideal

2. **Clear Questions**
   - One idea per question
   - Avoid jargon
   - Provide examples if needed

3. **Logical Flow**
   - Group related questions
   - Start easy, progress to specific
   - End with open-ended feedback

4. **Test Before Launch**
   - Take survey yourself
   - Test on mobile device
   - Check branching logic

### Question Writing

**Good Examples:**
- "How satisfied were you with the venue?" (Clear, specific)
- "Rate the keynote speaker (1=Poor, 5=Excellent)" (Defined scale)
- "What one thing could we improve?" (Focused, actionable)

**Avoid:**
- "Rate everything about the event" (Too broad)
- "The venue was good, wasn't it?" (Leading question)
- "How satisfied were you with the venue and food?" (Double-barreled)

### Results Analysis

1. **Look for Patterns**
   - Common themes in text responses
   - Consistent ratings across questions
   - Correlation between metrics

2. **Segment Data**
   - Export and filter by attributes
   - Compare early vs. late responses
   - Analyze by respondent type

3. **Act on Feedback**
   - Identify top improvements
   - Celebrate successes
   - Share results with team

---

## Troubleshooting

### Common Issues

**Survey Not Appearing:**
- Check survey is marked as "Active"
- Verify survey ID in URL is correct
- Refresh page

**Can't Submit Response:**
- Ensure all required fields completed
- Check for validation errors (red text)
- Try different browser if issue persists

**Results Not Updating:**
- Click **Refresh** button
- Check if submissions are actually coming in
- Wait a few seconds for processing

**Export Download Fails:**
- Check pop-up blocker settings
- Try different browser
- Contact administrator

### Getting Help

- Check documentation
- Contact system administrator
- Report bugs with:
  - What you were trying to do
  - What happened instead
  - Browser and device information
  - Screenshots if possible

---

## Tips & Tricks

### For Administrators

- **Use Templates** - Save successful survey structures
- **Test Extensively** - Take survey multiple times before launch
- **Monitor Live** - Keep Live page open during events
- **Export Early** - Download responses before event ends
- **Backup Data** - Keep copies of important surveys

### For Respondents

- **Use Desktop** - Better experience on larger screens
- **Save Time** - Answer required questions first
- **Be Honest** - Feedback helps improve future events
- **Write Details** - Specific comments are most valuable
- **Check Spelling** - Especially in text responses

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit form |
| `Space` | Check/uncheck checkbox |
| `Arrow Keys` | Select radio options |

---

## Mobile Experience

The application is fully responsive:
- ✅ Touch-friendly buttons
- ✅ Readable text sizes
- ✅ Optimized forms
- ✅ Swipe gestures (where applicable)
- ✅ Works on iOS and Android

---

## Privacy & Data

- Responses are anonymous by default
- Contact information only if provided
- Data stored securely
- Export and delete data anytime
- GDPR compliant (configure as needed)

See [Privacy Policy] for full details.

---

## Frequently Asked Questions

**Q: Can I edit a survey after it's live?**
A: Yes, but be careful! Adding questions is safe. Deleting questions will remove existing responses for those questions.

**Q: How many responses can the system handle?**
A: The system can handle thousands of responses. Performance depends on your hosting.

**Q: Can respondents save and resume later?**
A: Currently, responses are tied to the session. If they close the browser, they'll need to start over.

**Q: How do I get more than one admin?**
A: Contact your system administrator to create additional admin accounts.

**Q: Can I white-label the application?**
A: Yes, customize the branding in the configuration and CSS files.

**Q: Is there a mobile app?**
A: No native app, but the web app works great on mobile browsers.

---

For additional support, contact your system administrator or refer to the technical documentation.
