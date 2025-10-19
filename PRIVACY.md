# Privacy Policy - Event Survey

**Last Updated: October 17, 2025**

## Our Commitment to Your Privacy

We take your privacy seriously. This survey is designed with privacy-first principles to protect your anonymity while gathering valuable feedback.

## What We Collect

### Survey Responses (Anonymous)
- Your answers to survey questions
- Timestamp of submission
- Event identifier (e.g., "fall-summit-2025")
- **No personal identifying information**

### Optional Contact Information (Separate)
After completing the survey, you may **optionally** provide:
- Name
- Email address
- Company
- Role
- Consent for follow-up

**Important:** This contact information is stored completely separately from your survey responses and cannot be linked back to your answers.

## How We Protect Your Privacy

### Complete Data Separation
1. **No Linkage**: Survey responses and contact information are stored in separate database tables
2. **No Foreign Keys**: There is no database relationship connecting your responses to your contact details
3. **Random Identifiers**: Each submission uses a randomly generated ID (UUID v4) that has no connection to any personal information
4. **No Tracking**: We do not use cookies, browser fingerprinting, or any other tracking mechanisms for survey responses

### Technical Guarantees
- Survey responses are identified only by a random submission ID and timestamp
- Contact information (if provided) is stored in a separate table with its own random ID
- The only shared value is the event code (e.g., "fall-summit-2025"), which cannot be used to link responses to individuals
- Export files are separate: one for anonymous responses, one for contacts

## How We Use Your Data

### Survey Responses
- Aggregate analysis and reporting
- Creating visualizations (charts, graphs)
- Improving event planning
- Shared with event organizers in aggregate form only

### Contact Information (If Provided)
- Follow-up communications (only if you consented)
- Sending additional information about future events
- Responding to specific inquiries

**We will never:**
- Sell or rent your information to third parties
- Link your contact information to your survey responses
- Use your data for purposes other than stated above

## Data Retention

- **Survey Responses**: Retained for 24 months after event date
- **Contact Information**: Retained until you request deletion or withdraw consent
- **Audit Logs**: Retained for 12 months for security purposes

## Your Rights

You have the right to:
- Skip the contact form entirely (your survey is still valuable!)
- Withdraw consent for follow-up at any time
- Request deletion of your contact information
- Request a copy of any personal information we hold
- Ask questions about our data practices

## Data Security

We implement industry-standard security measures:
- Encrypted data transmission (HTTPS)
- Secure database storage
- Access controls and authentication for admin users
- Regular security audits
- No logging of personal information

## Children's Privacy

This survey is not intended for individuals under 16 years of age. We do not knowingly collect personal information from children.

## Changes to This Policy

We may update this privacy policy from time to time. The "Last Updated" date at the top indicates when changes were last made.

## Contact Us

If you have questions about this privacy policy or our data practices, please contact:
- Event Organizer: [events@example.com]
- Privacy Officer: [privacy@example.com]

## Technical Transparency

For developers and privacy advocates:
- Our codebase is open source
- Database schema includes unit tests proving no linkage between responses and contacts
- API endpoints explicitly reject any attempts to link responses to contact information
- All exports maintain strict separation of anonymous and identified data

---

**By clicking "Start Survey," you acknowledge that you have read and understood this privacy policy.**
