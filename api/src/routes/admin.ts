import { Router } from 'express';
import { z } from 'zod';
import { Parser } from 'json2csv';
import { prisma } from '../services/database';
import { logger } from '../config/logger';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { sendSuccess, sendCreated, sendError, sendNotFound } from '../utils/response';

// Define QuestionType enum locally
enum QuestionType {
  SINGLE = "SINGLE",
  MULTI = "MULTI",
  LIKERT = "LIKERT",
  TEXT = "TEXT",
  LONGTEXT = "LONGTEXT",
  NPS = "NPS",
  NUMBER = "NUMBER"
}

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// Helper function to create audit log
async function createAuditLog(req: any, action: string, entity: string, entityId: string, meta?: any) {
  await prisma.auditLog.create({
    data: {
      adminId: req.user?.id,
      action,
      entity,
      entityId,
      meta,
    },
  });
}

// ============================================================
// Survey CRUD
// ============================================================

const createSurveySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateSurveySchema = createSurveySchema.partial();

// GET /api/admin/surveys - List all surveys
router.get('/surveys', async (req, res, next) => {
  try {
    const surveys = await prisma.survey.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    return sendSuccess(res, surveys);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/surveys/:id - Get single survey
router.get('/surveys/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
              include: {
                options: {
                  orderBy: { order: 'asc' },
                  include: {
                    branchingRule: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!survey) {
      return sendNotFound(res, 'Survey not found');
    }

    return sendSuccess(res, survey);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/surveys - Create survey
router.post('/surveys', validate(createSurveySchema), async (req, res, next) => {
  try {
    const survey = await prisma.survey.create({
      data: req.body,
    });

    await createAuditLog(req, 'CREATE_SURVEY', 'Survey', survey.id, { title: survey.title });

    return sendCreated(res, survey);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/surveys/:id - Update survey
router.patch('/surveys/:id', validate(updateSurveySchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const survey = await prisma.survey.update({
      where: { id },
      data: req.body,
    });

    await createAuditLog(req, 'UPDATE_SURVEY', 'Survey', survey.id, req.body);

    return sendSuccess(res, survey);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/surveys/:id - Delete survey
router.delete('/surveys/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.survey.delete({
      where: { id },
    });

    await createAuditLog(req, 'DELETE_SURVEY', 'Survey', id);

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Section Management
// ============================================================

const createSectionSchema = z.object({
  surveyId: z.string().cuid(),
  title: z.string().min(1).max(200),
  order: z.number().int().min(0),
});

router.post('/sections', validate(createSectionSchema), async (req, res, next) => {
  try {
    const section = await prisma.section.create({
      data: req.body,
    });

    return sendCreated(res, section);
  } catch (error) {
    next(error);
  }
});

router.patch('/sections/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, order } = req.body;

    const section = await prisma.section.update({
      where: { id },
      data: { title, order },
    });

    return sendSuccess(res, section);
  } catch (error) {
    next(error);
  }
});

router.delete('/sections/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.section.delete({
      where: { id },
    });

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Question Management
// ============================================================

const createQuestionSchema = z.object({
  sectionId: z.string().cuid(),
  type: z.nativeEnum(QuestionType),
  prompt: z.string().min(1),
  helpText: z.string().optional(),
  required: z.boolean().optional(),
  order: z.number().int().min(0),
  options: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
    order: z.number().int().min(0),
  })).optional(),
});

router.post('/questions', validate(createQuestionSchema), async (req, res, next) => {
  try {
    const { options, ...questionData } = req.body;

    const question = await prisma.question.create({
      data: {
        ...questionData,
        options: options ? {
          create: options,
        } : undefined,
      },
      include: {
        options: true,
      },
    });

    return sendCreated(res, question);
  } catch (error) {
    next(error);
  }
});

router.patch('/questions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, prompt, helpText, required, order } = req.body;

    const question = await prisma.question.update({
      where: { id },
      data: { type, prompt, helpText, required, order },
    });

    return sendSuccess(res, question);
  } catch (error) {
    next(error);
  }
});

router.delete('/questions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.question.delete({
      where: { id },
    });

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Option Management
// ============================================================

router.post('/options', async (req, res, next) => {
  try {
    const { questionId, label, value, order } = req.body;

    const option = await prisma.option.create({
      data: { questionId, label, value, order },
    });

    return sendCreated(res, option);
  } catch (error) {
    next(error);
  }
});

router.patch('/options/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, value, order } = req.body;

    const option = await prisma.option.update({
      where: { id },
      data: { label, value, order },
    });

    return sendSuccess(res, option);
  } catch (error) {
    next(error);
  }
});

router.delete('/options/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.option.delete({
      where: { id },
    });

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Branching Rule Management
// ============================================================

const createBranchingRuleSchema = z.object({
  optionId: z.string().cuid(),
  action: z.enum(['SHOW_QUESTION', 'SKIP_TO_SECTION', 'SKIP_TO_END']),
  targetQuestionId: z.string().cuid().optional(),
  targetSectionId: z.string().cuid().optional(),
  skipToEnd: z.boolean().optional(),
});

router.post('/branching-rules', validate(createBranchingRuleSchema), async (req, res, next) => {
  try {
    const branchingRule = await prisma.branchingRule.create({
      data: req.body,
    });

    return sendCreated(res, branchingRule);
  } catch (error) {
    next(error);
  }
});

router.patch('/branching-rules/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, targetQuestionId, targetSectionId, skipToEnd } = req.body;

    const branchingRule = await prisma.branchingRule.update({
      where: { id },
      data: { action, targetQuestionId, targetSectionId, skipToEnd },
    });

    return sendSuccess(res, branchingRule);
  } catch (error) {
    next(error);
  }
});

router.delete('/branching-rules/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.branchingRule.delete({
      where: { id },
    });

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Analytics & Metrics
// ============================================================

// GET /api/admin/metrics/overview
router.get('/metrics/overview', async (req, res, next) => {
  try {
    const { surveyId, startDate, endDate } = req.query;

    if (!surveyId) {
      return sendError(res, 'surveyId is required', 400);
    }

    const whereClause: any = { surveyId: surveyId as string };
    if (startDate) {
      whereClause.createdAt = { gte: new Date(startDate as string) };
    }
    if (endDate) {
      whereClause.createdAt = { 
        ...whereClause.createdAt, 
        lte: new Date(endDate as string) 
      };
    }

    const totalSubmissions = await prisma.submission.count({
      where: whereClause,
    });

    const completedSubmissions = await prisma.submission.count({
      where: {
        ...whereClause,
        completedAt: { not: null },
      },
    });

    const submissions = await prisma.submission.findMany({
      where: {
        ...whereClause,
        completedAt: { not: null },
      },
      select: {
        createdAt: true,
        completedAt: true,
      },
    });

    // Calculate average completion time
    let avgTimeSeconds = 0;
    if (submissions.length > 0) {
      const totalTime = submissions.reduce((acc, sub) => {
        if (sub.completedAt) {
          return acc + (sub.completedAt.getTime() - sub.createdAt.getTime());
        }
        return acc;
      }, 0);
      avgTimeSeconds = Math.round(totalTime / submissions.length / 1000);
    }

    const completionRate = totalSubmissions > 0 
      ? Math.round((completedSubmissions / totalSubmissions) * 100) 
      : 0;

    return sendSuccess(res, {
      totalSubmissions,
      completedSubmissions,
      completionRate,
      avgCompletionTimeSeconds: avgTimeSeconds,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/metrics/question/:questionId
router.get('/metrics/question/:questionId', async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!question) {
      return sendNotFound(res, 'Question not found');
    }

    const answers = await prisma.answer.findMany({
      where: { questionId },
    });

    let analysis: any = {
      questionId,
      questionType: question.type,
      totalResponses: answers.length,
    };

    switch (question.type) {
      case QuestionType.SINGLE:
      case QuestionType.MULTI:
        const valueCounts: Record<string, number> = {};
        answers.forEach(answer => {
          answer.choiceValues.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
          });
        });
        analysis.distribution = valueCounts;
        break;

      case QuestionType.LIKERT:
      case QuestionType.NPS:
      case QuestionType.NUMBER:
        const numbers = answers
          .map(a => a.numberValue)
          .filter((n): n is number => n !== null);
        
        if (numbers.length > 0) {
          const sum = numbers.reduce((a, b) => a + b, 0);
          const sorted = [...numbers].sort((a, b) => a - b);
          analysis.average = sum / numbers.length;
          analysis.median = sorted[Math.floor(sorted.length / 2)];
          analysis.min = Math.min(...numbers);
          analysis.max = Math.max(...numbers);
          
          // Distribution for visualization
          const bins: Record<number, number> = {};
          numbers.forEach(n => {
            bins[n] = (bins[n] || 0) + 1;
          });
          analysis.distribution = bins;
        }
        break;

      case QuestionType.TEXT:
      case QuestionType.LONGTEXT:
        const texts = answers
          .map(a => a.textValue)
          .filter((t): t is string => t !== null && t.length > 0);
        
        analysis.responses = texts;
        analysis.wordCount = texts.reduce((acc, text) => {
          return acc + text.split(/\s+/).length;
        }, 0);
        break;
    }

    return sendSuccess(res, analysis);
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Import/Export
// ============================================================

// POST /api/admin/import - Import survey from JSON
const importSurveySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  sections: z.array(z.object({
    title: z.string().min(1),
    questions: z.array(z.object({
      type: z.enum(['SINGLE', 'MULTI', 'LIKERT', 'TEXT', 'LONGTEXT', 'NPS', 'NUMBER']),
      prompt: z.string().min(1),
      required: z.boolean().optional(),
      helpText: z.string().optional(),
      options: z.array(z.string()).optional(),
    })),
  })),
});

router.post('/import', validate(importSurveySchema), async (req, res, next) => {
  try {
    const { title, description, sections } = req.body;

    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        isActive: false,
        sections: {
          create: sections.map((section: any, sectionIdx: number) => ({
            title: section.title,
            order: sectionIdx + 1,
            questions: {
              create: section.questions.map((q: any, qIdx: number) => ({
                type: q.type as QuestionType,
                prompt: q.prompt,
                helpText: q.helpText,
                required: q.required || false,
                order: qIdx + 1,
                options: q.options ? {
                  create: q.options.map((opt: string, optIdx: number) => ({
                    label: opt,
                    value: opt.toLowerCase().replace(/\s+/g, '-'),
                    order: optIdx + 1,
                  })),
                } : undefined,
              })),
            },
          })),
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

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: (req.user as any)?.id,
        action: 'IMPORT_SURVEY',
        entity: 'Survey',
        entityId: survey.id,
        meta: { title: survey.title },
      },
    });

    return sendCreated(res, survey);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/export/responses.csv
router.get('/export/responses.csv', async (req, res, next) => {
  try {
    const { surveyId } = req.query;

    if (!surveyId) {
      return sendError(res, 'surveyId is required', 400);
    }

    const submissions = await prisma.submission.findMany({
      where: { surveyId: surveyId as string },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    // Flatten data for CSV
    const rows = submissions.map(submission => {
      const row: any = {
        submission_id: submission.id,
        event_slug: submission.eventSlug,
        created_at: submission.createdAt.toISOString(),
        completed_at: submission.completedAt?.toISOString() || '',
      };

      submission.answers.forEach(answer => {
        const questionPrompt = answer.question.prompt.substring(0, 50);
        
        if (answer.choiceValues.length > 0) {
          row[questionPrompt] = answer.choiceValues.join(', ');
        } else if (answer.textValue) {
          row[questionPrompt] = answer.textValue;
        } else if (answer.numberValue !== null) {
          row[questionPrompt] = answer.numberValue;
        }
      });

      return row;
    });

    const parser = new Parser();
    const csv = parser.parse(rows);

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: (req.user as any)?.id,
        action: 'EXPORT_RESPONSES',
        entity: 'Survey',
        entityId: surveyId as string,
      },
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="responses-${surveyId}.csv"`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/export/contacts.csv
router.get('/export/contacts.csv', async (req, res, next) => {
  try {
    const { eventSlug } = req.query;

    if (!eventSlug) {
      return sendError(res, 'eventSlug is required', 400);
    }

    const contacts = await prisma.contact.findMany({
      where: { eventSlug: eventSlug as string },
      orderBy: { createdAt: 'desc' },
    });

    const rows = contacts.map(contact => ({
      contact_id: contact.id,
      event_slug: contact.eventSlug,
      name: contact.name || '',
      email: contact.email || '',
      company: contact.company || '',
      role: contact.role || '',
      consent: contact.consent,
      created_at: contact.createdAt.toISOString(),
    }));

    const parser = new Parser();
    const csv = parser.parse(rows);

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: (req.user as any)?.id,
        action: 'EXPORT_CONTACTS',
        meta: { eventSlug },
      },
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="contacts-${eventSlug}.csv"`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Audit Log
// ============================================================

router.get('/audit', async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const logs = await prisma.auditLog.findMany({
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            email: true,
          },
        },
      },
    });

    return sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
});

export default router;
