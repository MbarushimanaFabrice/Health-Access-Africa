import { Router } from 'express';
import {
  getAllUsersController,
  updateUserStatusController,
  deleteUserController,
  getStatsController,
  createDoctorController,
  getAllAppointmentsController,
} from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { requirePasswordChange } from '../../middleware/requirePasswordChange.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createDoctorSchema } from './admin.schema';

const router = Router();

router.use(authenticate, requirePasswordChange, authorize('admin'));

router.get('/users', getAllUsersController);
router.patch('/users/:id/status', updateUserStatusController);
router.delete('/users/:id', deleteUserController);
router.get('/stats', getStatsController);
router.post('/doctors', validate(createDoctorSchema), createDoctorController);
router.get('/appointments', getAllAppointmentsController);

export default router;
