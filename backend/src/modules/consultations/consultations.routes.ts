import { Router } from 'express';
import {
  createConsultationController,
  updateConsultationController,
  saveConsultationController,
  getMyConsultationsController,
  getConsultationController,
  getOrCreateVideoRoomController,
} from './consultations.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { requirePasswordChange } from '../../middleware/requirePasswordChange.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createConsultationSchema,
  saveConsultationSchema,
  updateConsultationSchema,
} from './consultations.schema';

const router = Router();

router.use(authenticate, requirePasswordChange);

router.post(
  '/',
  authorize('doctor'),
  validate(createConsultationSchema),
  createConsultationController
);

router.put(
  '/appointment/:appointmentId',
  authorize('doctor'),
  validate(saveConsultationSchema),
  saveConsultationController
);

router.patch(
  '/:id',
  authorize('doctor'),
  validate(updateConsultationSchema),
  updateConsultationController
);

router.get('/me', authorize('patient', 'doctor', 'admin'), getMyConsultationsController);

router.post(
  '/:appointmentId/video',
  authorize('patient', 'doctor'),
  getOrCreateVideoRoomController
);

router.get(
  '/:appointmentId',
  authorize('patient', 'doctor', 'admin'),
  getConsultationController
);

export default router;
