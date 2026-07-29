import { Router } from 'express';
import {
  createSlotsController,
  getMySlotsController,
  getAvailableSlotsController,
  deleteSlotController,
} from './availability.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { requirePasswordChange } from '../../middleware/requirePasswordChange.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createSlotsSchema } from './availability.schema';

const router = Router();

router.use(authenticate, requirePasswordChange);

router.post('/', authorize('doctor'), validate(createSlotsSchema), createSlotsController);

router.get('/me', authorize('doctor'), getMySlotsController);

router.get(
  '/doctor/:doctorId',
  authorize('patient', 'doctor', 'admin'),
  getAvailableSlotsController
);

router.delete('/:id', authorize('doctor'), deleteSlotController);

export default router;
