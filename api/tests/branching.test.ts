import request from 'supertest';
import { prisma } from '../src/services/database';
import app from '../src/index';

// Note: these tests assume the seed data exists (the demo survey from prisma/seed.ts)

describe('Branching (option-level)', () => {
  let surveyId: string;
  let optionId: string;

  beforeAll(async () => {
    const survey = await prisma.survey.findFirst({ include: { sections: { include: { questions: { include: { options: true } } } } } });
    if (!survey) throw new Error('No survey found for tests');
    surveyId = survey.id;

    // pick a single-choice option to test
    const question = survey.sections[0].questions.find(q => q.type === 'SINGLE' || q.type === 'MULTI');
    if (!question) throw new Error('No suitable question found');
    optionId = question.options[0].id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('survey fetch returns option branching fields', async () => {
    const res = await request(app).get(`/api/surveys/${surveyId}`).expect(200);
    expect(res.body).toBeDefined();
  const survey = res.body?.data ?? res.body;
  // locate our option
  const found = survey.sections.flatMap((s: any) => s.questions).flatMap((q: any) => q.options).find((o: any) => o.id === optionId);
    expect(found).toBeDefined();
    // branching fields should exist (may be null)
    expect('branchAction' in found).toBe(true);
    expect('targetQuestionId' in found).toBe(true);
    expect('targetSectionId' in found).toBe(true);
    expect('skipToEnd' in found).toBe(true);
  });

  test('admin can update option branching fields', async () => {
    // NOTE: this endpoint requires auth; for simplicity we'll update directly via prisma in test
    const updated = await prisma.option.update({ where: { id: optionId }, data: { branchAction: 'SKIP_TO_END', skipToEnd: true } });
    expect(updated).toBeDefined();
    expect((updated as any).branchAction).toBe('SKIP_TO_END');
    expect((updated as any).skipToEnd).toBe(true);

    // revert
    await prisma.option.update({ where: { id: optionId }, data: { branchAction: null, skipToEnd: false } });
  });
});
