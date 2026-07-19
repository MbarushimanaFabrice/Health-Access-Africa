import { Router } from 'express';
import { getPatientController, updatePatientController } from './patients.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { requirePasswordChange } from '../../middleware/requirePasswordChange.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updatePatientProfileSchema } from './patients.schema';

const router = Router();

router.use(authenticate, requirePasswordChange);

router.get('/:id', authorize('doctor', 'admin', 'patient'), getPatientController);

router.patch(
  '/:id',
  authorize('doctor', 'patient'),
  validate(updatePatientProfileSchema),
  updatePatientController
);

export default router;
