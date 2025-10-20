// Jest setup: provide a lightweight mock for @prisma/client so tests that
// don't need a real DB can run quickly. Tests that require real data should
// still use integration tests with a real DB.

jest.mock('@prisma/client', () => {
  // Minimal in-memory dataset to satisfy tests that expect a seeded demo survey
  const data = {
    surveys: [
      {
        id: 'survey-1',
        title: 'Demo Survey',
        sections: [
          {
            id: 'section-1',
            title: 'Overall Experience',
            order: 1,
            questions: [
              {
                id: 'question-1',
                type: 'SINGLE',
                prompt: 'What was your favorite part?',
                order: 1,
                options: [
                  { id: 'option-1', label: 'Keynote', value: 'keynote', order: 1, branchAction: null, targetQuestionId: null, targetSectionId: null, skipToEnd: false },
                ],
              },
            ],
          },
        ],
      },
    ],
    options: [
      { id: 'option-1', label: 'Keynote', value: 'keynote', order: 1, branchAction: null, targetQuestionId: null, targetSectionId: null, skipToEnd: false },
    ],
    contacts: [],
    submissions: [],
  } as any;

  function findFirstFromArray(arr: any[], _args?: any) {
    return arr.length > 0 ? arr[0] : null;
  }

  class Model {
    private arr: any[];
    constructor(arr: any[]) { this.arr = arr; }
    async findFirst(_args?: any) { return findFirstFromArray(this.arr, _args); }
    async findMany(_args?: any) { return this.arr.slice(0); }
    async findUnique(args: any) {
      const id = args?.where?.id;
      return this.arr.find((i: any) => i.id === id) || null;
    }
    async update(args: any) {
      const id = args?.where?.id;
      const item = this.arr.find((i: any) => i.id === id);
      if (!item) throw new Error('Not found');
      Object.assign(item, args.data || {});
      return item;
    }
    async create(args: any) {
      const obj = { id: `gen-${Math.random().toString(36).slice(2, 9)}`, ...(args.data || {}) };
      this.arr.push(obj);
      return obj;
    }
  }

  class PrismaClient {
    survey = new Model(data.surveys);
    section = new Model(data.surveys.flatMap((s: any) => s.sections));
    question = new Model(data.surveys.flatMap((s: any) => s.sections).flatMap((sec: any) => sec.questions));
    option = new Model(data.options);
    contact = new Model(data.contacts);
    submission = new Model(data.submissions);
    answer = new Model([]);
    adminUser = new Model([]);
    auditLog = new Model([]);

    async $disconnect() { /* noop */ }
  }

  return { PrismaClient };
});
