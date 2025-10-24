import { PrismaClient, QuestionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.section.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.adminUser.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.create({
    data: {
      email: adminEmail,
      passwordHash,
    },
  });

  console.log(`✅ Admin created: ${adminEmail}`);

  // Create demo survey with all question types
  console.log('📋 Creating demo survey...');
  const eventSlug = process.env.DEFAULT_EVENT_SLUG || 'fall-summit-2025';

  const survey = await prisma.survey.create({
    data: {
      title: 'Fall Summit 2025 Feedback',
      description: 'Help us improve future events with your quick feedback (5 minutes)',
      isActive: true,
      sections: {
        create: [
          {
            title: 'Overall Experience',
            order: 1,
            questions: {
              create: [
                {
                  type: QuestionType.LIKERT,
                  prompt: 'How would you rate the overall event?',
                  helpText: '1 = Poor, 5 = Excellent',
                  required: true,
                  order: 1,
                },
                {
                  type: QuestionType.NPS,
                  prompt: 'How likely are you to recommend this event to a colleague?',
                  helpText: '0 = Not at all likely, 10 = Extremely likely',
                  required: true,
                  order: 2,
                },
                {
                  type: QuestionType.SINGLE,
                  prompt: 'What was your favorite part of the event?',
                  required: false,
                  order: 3,
                  options: {
                    create: [
                      { label: 'Keynote Presentations', value: 'keynote', order: 1 },
                      { label: 'Panel Discussions', value: 'panel', order: 2 },
                      { label: 'Workshops', value: 'workshop', order: 3 },
                      { label: 'Networking Sessions', value: 'networking', order: 4 },
                      { label: 'Exhibition Area', value: 'exhibition', order: 5 },
                    ],
                  },
                },
                {
                  type: QuestionType.MULTI,
                  prompt: 'Which topics were most valuable to you? (Select all that apply)',
                  required: false,
                  order: 4,
                  options: {
                    create: [
                      { label: 'AI & Machine Learning', value: 'ai-ml', order: 1 },
                      { label: 'Cloud Infrastructure', value: 'cloud', order: 2 },
                      { label: 'DevOps & CI/CD', value: 'devops', order: 3 },
                      { label: 'Security & Privacy', value: 'security', order: 4 },
                      { label: 'Data Analytics', value: 'analytics', order: 5 },
                      { label: 'Product Design', value: 'design', order: 6 },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'Logistics & Venue',
            order: 2,
            questions: {
              create: [
                {
                  type: QuestionType.LIKERT,
                  prompt: 'How would you rate the venue and facilities?',
                  required: false,
                  order: 1,
                },
                {
                  type: QuestionType.LIKERT,
                  prompt: 'How would you rate the food and beverages?',
                  required: false,
                  order: 2,
                },
                {
                  type: QuestionType.LIKERT,
                  prompt: 'How would you rate the registration process?',
                  required: false,
                  order: 3,
                },
                {
                  type: QuestionType.SINGLE,
                  prompt: 'Was the event duration appropriate?',
                  required: false,
                  order: 4,
                  options: {
                    create: [
                      { label: 'Too short', value: 'too-short', order: 1 },
                      { label: 'Just right', value: 'just-right', order: 2 },
                      { label: 'Too long', value: 'too-long', order: 3 },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'Open Feedback',
            order: 3,
            questions: {
              create: [
                {
                  type: QuestionType.TEXT,
                  prompt: 'What was the highlight of the event for you?',
                  helpText: 'One sentence is fine!',
                  required: false,
                  order: 1,
                },
                {
                  type: QuestionType.LONGTEXT,
                  prompt: 'What could we improve for next time?',
                  helpText: 'Be as detailed as you like',
                  required: false,
                  order: 2,
                },
                {
                  type: QuestionType.LONGTEXT,
                  prompt: 'Any other comments or suggestions?',
                  required: false,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      sections: {
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  });

  console.log(`✅ Survey created: ${survey.title}`);

  // Create 25 fake responses
  console.log('📊 Creating 25 fake responses...');
  const questions = await prisma.question.findMany({
    where: { section: { surveyId: survey.id } },
    include: { options: true },
  });

  const responses = [
    'Great event!',
    'Very informative sessions',
    'Loved the networking opportunities',
    'Excellent speakers',
    'Well organized',
    'Could use better WiFi',
    'More hands-on workshops please',
    'Amazing venue',
    'Perfect mix of topics',
    'Would definitely attend again',
  ];

  const improvements = [
    'More time for Q&A',
    'Better signage around the venue',
    'Longer breaks between sessions',
    'More vegetarian food options',
    'Earlier start times',
    'Include virtual attendance option',
    'More interactive sessions',
    'Provide session recordings',
    'Better parking information',
    'More seating in common areas',
  ];

  for (let i = 0; i < 25; i++) {
    // Random timestamp within last 3 days
    const hoursAgo = Math.floor(Math.random() * 72);
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const submission = await prisma.submission.create({
      data: {
        surveyId: survey.id,
        eventSlug,
        createdAt,
        completedAt: new Date(createdAt.getTime() + Math.random() * 10 * 60 * 1000),
      },
    });

    for (const question of questions) {
      let answerData: any = {
        submissionId: submission.id,
        questionId: question.id,
      };

      switch (question.type) {
        case QuestionType.LIKERT:
          answerData.numberValue = Math.floor(Math.random() * 5) + 1;
          answerData.choiceValues = [];
          break;

        case QuestionType.NPS:
          answerData.numberValue = Math.floor(Math.random() * 11);
          answerData.choiceValues = [];
          break;

        case QuestionType.SINGLE:
          if (question.options.length > 0) {
            const option = question.options[Math.floor(Math.random() * question.options.length)];
            answerData.choiceValues = [option.value];
          }
          break;

        case QuestionType.MULTI:
          if (question.options.length > 0) {
            const numSelections = Math.floor(Math.random() * 3) + 1;
            const shuffled = [...question.options].sort(() => Math.random() - 0.5);
            answerData.choiceValues = shuffled.slice(0, numSelections).map(o => o.value);
          }
          break;

        case QuestionType.TEXT:
          if (Math.random() > 0.3) {
            answerData.textValue = responses[Math.floor(Math.random() * responses.length)];
            answerData.choiceValues = [];
          }
          break;

        case QuestionType.LONGTEXT:
          if (Math.random() > 0.4) {
            const numSentences = Math.floor(Math.random() * 3) + 1;
            const sentences = Array.from(
              { length: numSentences },
              () => improvements[Math.floor(Math.random() * improvements.length)]
            );
            answerData.textValue = sentences.join('. ') + '.';
            answerData.choiceValues = [];
          }
          break;

        case QuestionType.NUMBER:
          answerData.numberValue = Math.floor(Math.random() * 100);
          answerData.choiceValues = [];
          break;
      }

      // Only create answer if user "answered" the question (skip some optional ones)
      if (question.required || Math.random() > 0.2) {
        await prisma.answer.create({ data: answerData });
      }
    }
  }

  console.log('✅ 25 responses created');

  // Create 10 fake contacts (separate from responses)
  console.log('👥 Creating 10 fake contacts...');
  const names = [
    'Sarah Johnson',
    'Michael Chen',
    'Emily Rodriguez',
    'David Kim',
    'Jessica Taylor',
    'James Wilson',
    'Maria Garcia',
    'Robert Anderson',
    'Lisa Martinez',
    'Christopher Lee',
  ];

  const companies = [
    'Tech Innovations Inc',
    'Global Solutions Ltd',
    'Digital Ventures',
    'Future Systems Corp',
    'Smart Technologies',
    'NextGen Solutions',
    'Cloud Dynamics',
    'Data Insights Co',
    'Innovation Labs',
    'Synergy Systems',
  ];

  const roles = [
    'Software Engineer',
    'Product Manager',
    'CTO',
    'VP Engineering',
    'Data Scientist',
    'DevOps Engineer',
    'UX Designer',
    'Solutions Architect',
    'Engineering Manager',
    'Technical Lead',
  ];

  for (let i = 0; i < 10; i++) {
    const hoursAgo = Math.floor(Math.random() * 72);
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    await prisma.contact.create({
      data: {
        eventSlug,
        name: names[i],
        email: names[i].toLowerCase().replace(' ', '.') + '@example.com',
        company: companies[i],
        role: roles[i],
        consent: Math.random() > 0.2, // 80% consent
        createdAt,
      },
    });
  }

  console.log('✅ 10 contacts created');

  // Create audit log entries
  console.log('📝 Creating audit log entries...');
  await prisma.auditLog.createMany({
    data: [
      {
        adminId: admin.id,
        action: 'LOGIN',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        adminId: admin.id,
        action: 'CREATE_SURVEY',
        entity: 'Survey',
        entityId: survey.id,
        meta: { title: survey.title },
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
      {
        adminId: admin.id,
        action: 'ACTIVATE_SURVEY',
        entity: 'Survey',
        entityId: survey.id,
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Audit log created');
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Demo Survey ID:', survey.id);
  console.log('👤 Admin Email:', adminEmail);
  console.log('🔑 Admin Password:', adminPassword);
  console.log('🎫 Event Slug:', eventSlug);
  console.log('📊 Responses:', 25);
  console.log('👥 Contacts:', 10);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
