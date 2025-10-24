import { PrismaClient } from '@prisma/client';
import { prisma } from './database';
import { NotFoundError } from '../utils/errors';

export class SubmissionService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async create(data: { surveyId: string; eventSlug: string }) {
    return this.db.submission.create({
      data: {
        ...data,
        answers: {
          create: [],
        },
      },
    });
  }

  async findById(id: string, includeAnswers = false) {
    const submission = await this.db.submission.findUnique({
      where: { id },
      include: {
        answers: includeAnswers,
      },
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    return submission;
  }

  async submitAnswers(
    submissionId: string,
    answers: Array<{
      questionId: string;
      choiceValues?: string[];
      textValue?: string;
      numberValue?: number;
    }>
  ) {
    // First validate that the submission exists and isn't completed
    const submission = await this.findById(submissionId);
    if (submission.completedAt) {
      throw new Error('Submission already completed');
    }

    // Create all answers in a transaction
    return this.db.$transaction(async tx => {
      // Delete any existing answers for these questions
      await tx.answer.deleteMany({
        where: {
          submissionId,
          questionId: { in: answers.map(a => a.questionId) },
        },
      });

      // Create new answers
      for (const answer of answers) {
        await tx.answer.create({
          data: {
            submissionId,
            ...answer,
          },
        });
      }

      return tx.submission.findUnique({
        where: { id: submissionId },
        include: { answers: true },
      });
    });
  }

  async complete(id: string) {
    return this.db.submission.update({
      where: { id },
      data: {
        completedAt: new Date(),
      },
    });
  }

  async getQuestionMetrics(questionId: string) {
    // Get all answers for this question
    const answers = await this.db.answer.findMany({
      where: { questionId },
      include: {
        question: true,
      },
    });

    // Calculate metrics based on question type
    const question = answers[0]?.question;
    if (!question) {
      throw new NotFoundError('Question not found');
    }

    // Initialize base metrics
    const metrics = {
      questionId,
      type: question.type,
      totalResponses: answers.length,
      choiceCounts: {} as Record<string, number>,
      textResponses: [] as string[],
      numberStats: {
        min: null as number | null,
        max: null as number | null,
        avg: null as number | null,
      },
    };

    // Process answers based on type
    answers.forEach(answer => {
      if (answer.choiceValues?.length) {
        answer.choiceValues.forEach(value => {
          metrics.choiceCounts[value] = (metrics.choiceCounts[value] || 0) + 1;
        });
      }
      if (answer.textValue) {
        metrics.textResponses.push(answer.textValue);
      }
      if (answer.numberValue !== null && answer.numberValue !== undefined) {
        const val = answer.numberValue;
        metrics.numberStats.min =
          metrics.numberStats.min === null ? val : Math.min(metrics.numberStats.min, val);
        metrics.numberStats.max =
          metrics.numberStats.max === null ? val : Math.max(metrics.numberStats.max, val);
        if (metrics.numberStats.avg === null) metrics.numberStats.avg = val;
        else metrics.numberStats.avg = (metrics.numberStats.avg + val) / 2;
      }
    });

    return metrics;
  }
}
