import { PrismaClient } from '@prisma/client';
import { prisma } from './database';
import { NotFoundError } from '../utils/errors';

type SurveyInclude = {
  sections?: boolean;
  questions?: boolean;
  options?: boolean;
  submissions?: boolean;
};

// The service is implemented as a simple module of functions that use the shared
// `prisma` client. This keeps usage simple (no class instantiation needed) and
// makes the API easier to mock in tests.
const db: PrismaClient = prisma;

export async function findActive() {
  const survey = await db.survey.findFirst({
    where: { isActive: true },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!survey) {
    throw new NotFoundError('No active survey found');
  }

  return survey;
}

export async function findById(id: string, include: SurveyInclude = {}) {
  const survey = await db.survey.findUnique({
    where: { id },
    include: {
      sections: include.sections
        ? {
            orderBy: { order: 'asc' },
            include: {
              questions: include.questions
                ? {
                    orderBy: { order: 'asc' },
                    include: {
                      options: include.options
                        ? {
                            orderBy: { order: 'asc' },
                          }
                        : false,
                    },
                  }
                : false,
            },
          }
        : false,
      submissions: include.submissions || false,
    },
  });

  if (!survey) {
    throw new NotFoundError('Survey not found');
  }

  return survey;
}

export async function list() {
  return db.survey.findMany({
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
}

export async function create(data: { title: string; description?: string; isActive?: boolean }) {
  return db.survey.create({ data });
}

export async function update(id: string, data: Partial<Record<string, unknown>>) {
  return db.survey.update({
    where: { id },
    data,
  });
}

async function deleteSurvey(id: string) {
  return db.survey.delete({ where: { id } });
}

// Metrics
export async function getMetricsOverview(surveyId: string) {
  // Ensure survey exists and get the title with a lightweight select.
  const survey = await db.survey.findUnique({ where: { id: surveyId }, select: { title: true } });
  if (!survey) {
    throw new NotFoundError('Survey not found');
  }

  // Get submission counts in parallel.
  const [totalSubmissions, completedSubmissions] = await Promise.all([
    db.submission.count({ where: { surveyId } }),
    db.submission.count({ where: { surveyId, completedAt: { not: null } } }),
  ]);

  const completionRate =
    totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0;

  // Compute average completion time on the DB side for efficiency.
  // This returns the average number of seconds (as a float) between createdAt and completedAt.
  const avgResult: Array<{ avg: number | null } & Record<string, unknown>> = await db.$queryRaw`
    SELECT AVG(EXTRACT(EPOCH FROM ("completedAt" - "createdAt"))) AS avg
    FROM "Submission"
    WHERE "surveyId" = ${surveyId} AND "completedAt" IS NOT NULL
  `;

  const avgRaw = Array.isArray(avgResult) && avgResult.length > 0 ? avgResult[0].avg : null;
  const avgCompletionTimeSeconds = avgRaw != null ? Math.round(Number(avgRaw)) : 0;

  // Count questions belonging to the survey without loading sections/questions into memory.
  const questionCount = await db.question.count({ where: { section: { surveyId } } });

  return {
    totalSubmissions,
    completedSubmissions,
    completionRate,
    avgCompletionTimeSeconds,
    title: survey.title,
    questionCount,
  };
}

// Export a simple object for callers that prefer a single import.
export const surveyService = {
  findActive,
  findById,
  list,
  create,
  update,
  delete: deleteSurvey,
  getMetricsOverview,
};
