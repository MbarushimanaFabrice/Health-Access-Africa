import { Router } from 'express';
import {
  createAppointmentController,
  getMyAppointmentsController,
  updateAppointmentStatusController,
  deleteAppointmentController,
} from './appointments.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { requirePasswordChange } from '../../middleware/requirePasswordChange.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from './appointments.schema';

const router = Router();

router.use(authenticate, requirePasswordChange);

router.post(
  '/',
  authorize('patient'),
  validate(createAppointmentSchema),
  createAppointmentController
);

router.get('/me', authorize('patient', 'doctor'), getMyAppointmentsController);

router.patch(
  '/:id/status',
  authorize('patient', 'doctor'),
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatusController
);

router.delete('/:id', authorize('patient'), deleteAppointmentController);

export default router;
