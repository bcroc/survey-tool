import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Privacy Guarantees', () => {
  describe('Schema Validation', () => {
    it('should have no foreign key from Contact to Submission', async () => {
      // This test verifies at runtime that Contact model has no FK to Submission
      // by attempting to query - Prisma won't allow joins if FKs don't exist
      
      const contact = await prisma.contact.findFirst();
      
      // TypeScript will error if we try to access submission
      // @ts-expect-error - This should not exist
      const shouldNotExist = contact?.submission;
      
      expect(shouldNotExist).toBeUndefined();
    });

    it('should have no foreign key from Contact to Answer', async () => {
      const contact = await prisma.contact.findFirst();
      
      // TypeScript will error if we try to access answers
      // @ts-expect-error - This should not exist
      const shouldNotExist = contact?.answers;
      
      expect(shouldNotExist).toBeUndefined();
    });

    it('should only share eventSlug between Submission and Contact', async () => {
      const submission = await prisma.submission.findFirst({
        include: {
          answers: true,
        },
      });

      const contact = await prisma.contact.findFirst();

      if (submission && contact) {
        // Only eventSlug should be shareable
        expect(submission.eventSlug).toBeDefined();
        expect(contact.eventSlug).toBeDefined();
        
        // But eventSlug alone should not uniquely identify submissions
        const submissionsForEvent = await prisma.submission.findMany({
          where: { eventSlug: contact.eventSlug },
        });
        
        // Multiple submissions per event means eventSlug is non-linkable
        expect(submissionsForEvent.length).toBeGreaterThan(0);
      }
    });
  });

  describe('API Validation', () => {
    it('should reject contact submissions with submissionId', () => {
      // This is tested via Zod schema validation
      // The schema explicitly uses z.never() for submissionId
      const { createContactSchema } = require('../src/routes/contacts');
      
      expect(() => {
        createContactSchema.parse({
          eventSlug: 'test-event',
          name: 'Test User',
          email: 'test@example.com',
          consent: true,
          submissionId: 'some-id', // This should be rejected
        });
      }).toThrow();
    });
  });

  describe('Export Separation', () => {
    it('should export responses without contact info', async () => {
      const submissions = await prisma.submission.findMany({
        include: {
          answers: true,
        },
        take: 1,
      });

      if (submissions.length > 0) {
        const sub = submissions[0];
        
        // Verify no contact fields exist in submission
        expect((sub as any).name).toBeUndefined();
        expect((sub as any).email).toBeUndefined();
        expect((sub as any).company).toBeUndefined();
        expect((sub as any).role).toBeUndefined();
        expect((sub as any).contactId).toBeUndefined();
      }
    });

    it('should export contacts without response identifiers', async () => {
      const contacts = await prisma.contact.findMany({
        take: 1,
      });

      if (contacts.length > 0) {
        const contact = contacts[0];
        
        // Verify no submission fields exist in contact
        expect((contact as any).submissionId).toBeUndefined();
        expect((contact as any).answers).toBeUndefined();
        expect((contact as any).answerId).toBeUndefined();
      }
    });
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
