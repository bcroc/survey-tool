import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../services/database';
import { validate } from '../middleware/validation';
import { sendCreated, sendError } from '../utils/response';

const router = Router();

// Validation schema
export const createContactSchema = z.object({
  eventSlug: z.string().min(1).max(100),
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  company: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  consent: z.boolean(),
  // CRITICAL: Explicitly reject any submission identifiers
  submissionId: z.never().optional(),
  responseId: z.never().optional(),
  answerId: z.never().optional(),
}).strict(); // Strict mode to reject unknown fields

// POST /api/contacts - Store contact information (SEPARATE from responses)
router.post('/', validate(createContactSchema), async (req, res, next) => {
  try {
    const { eventSlug, name, email, company, role, consent } = req.body;

    // Additional validation: At least one contact field must be provided
    if (!name && !email && !company && !role) {
      return sendError(
        res,
        'At least one contact field (name, email, company, or role) must be provided',
        400
      );
    }

    // If consent is false, still store but mark as no-consent
    const contact = await prisma.contact.create({
      data: {
        eventSlug,
        name,
        email,
        company,
        role,
        consent,
      },
    });

    return sendCreated(
      res,
      { contactId: contact.id },
      consent ? "Thank you! We'll be in touch soon." : 'Contact information saved without consent for follow-up.'
    );
  } catch (error) {
    next(error);
  }
});

export default router;
