import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../services/database';
import { validate } from '../middleware/validation';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { NotFoundError } from '../utils/errors';

const router = Router();

// Validation schemas
const createSubmissionSchema = z.object({
  surveyId: z.string().cuid(),
  eventSlug: z.string().min(1).max(100),
});

const submitAnswersSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().cuid(),
        choiceValues: z.array(z.string()).optional(),
        textValue: z.string().optional(),
        numberValue: z.number().optional(),
      })
    )
    .min(1, 'At least one answer is required'),
});

const completeSubmissionSchema = z.object({
  completedAt: z.string().datetime().optional(),
});

// POST /api/submissions - Create new submission
router.post(
  '/',
  validate(createSubmissionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { surveyId, eventSlug } = req.body;

      // Verify survey exists and is active
      const survey = await prisma.survey.findUnique({
        where: { id: surveyId },
      });

      if (!survey) {
        throw new NotFoundError('Survey not found');
      }

      if (!survey.isActive) {
        return sendError(res, 'Survey is not currently active', 400);
      }

      const submission = await prisma.submission.create({
        data: {
          surveyId,
          eventSlug,
        },
      });

      return sendCreated(res, { submissionId: submission.id }, 'Submission created successfully');
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/submissions/:id/answers - Submit/update answers
router.post(
  '/:id/answers',
  validate(submitAnswersSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;

      // Verify submission exists
      const submission = await prisma.submission.findUnique({
        where: { id },
      });

      if (!submission) {
        throw new NotFoundError('Submission not found');
      }

      // Check if submission is already completed
      if (submission.completedAt) {
        return sendError(res, 'Cannot modify answers for a completed submission', 400);
      }

      type AnswerPayload = {
        questionId: string;
        choiceValues?: string[];
        textValue?: string | null;
        numberValue?: number | null;
      };

      // Bulk upsert answers
      const upsertPromises = answers.map((answer: AnswerPayload) =>
        prisma.answer.upsert({
          where: {
            submissionId_questionId: {
              submissionId: id,
              questionId: answer.questionId,
            },
          },
          create: {
            submissionId: id,
            questionId: answer.questionId,
            choiceValues: answer.choiceValues || [],
            textValue: answer.textValue,
            numberValue: answer.numberValue,
          },
          update: {
            choiceValues: answer.choiceValues || [],
            textValue: answer.textValue,
            numberValue: answer.numberValue,
          },
        })
      );

      await Promise.all(upsertPromises);

      return sendSuccess(res, null, 'Answers saved successfully');
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/submissions/:id/complete - Mark submission as complete
router.post(
  '/:id/complete',
  validate(completeSubmissionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const submission = await prisma.submission.findUnique({
        where: { id },
      });

      if (!submission) {
        throw new NotFoundError('Submission not found');
      }

      if (submission.completedAt) {
        return sendError(res, 'Submission already completed', 400);
      }

      await prisma.submission.update({
        where: { id },
        data: {
          completedAt: new Date(),
        },
      });

      return sendSuccess(
        res,
        {
          nextRoute: '/thanks',
        },
        'Survey completed successfully'
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
