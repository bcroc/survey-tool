import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../services/database';
import { validateQuery } from '../middleware/validation';
import { sendSuccess, sendNotFound } from '../utils/response';

const router = Router();

// GET /api/surveys/active - Get active survey for an event
router.get(
  '/active',
  validateQuery(
    z.object({
      eventSlug: z.string().min(1, 'eventSlug query parameter is required'),
    })
  ),
  async (req, res, next) => {
  try {
    // Currently we don't scope surveys by event; eventSlug is accepted for future use

    const survey = await prisma.survey.findFirst({
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
      return sendNotFound(res, 'No active survey found');
    }

    return sendSuccess(res, survey);
  } catch (error) {
    next(error);
  }
}
);

// GET /api/surveys/:id - Get specific survey (public)
router.get('/:id', async (req, res, next) => {
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

export default router;
