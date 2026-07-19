import { Router } from 'express';
import {
  getAllHealthInfoController,
  getHealthInfoByIdController,
  createHealthInfoController,
  updateHealthInfoController,
  deleteHealthInfoController,
} from './health-info.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { requirePasswordChange } from '../../middleware/requirePasswordChange.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createHealthInfoSchema, updateHealthInfoSchema } from './health-info.schema';

const router = Router();

router.use(authenticate, requirePasswordChange);

router.get('/', getAllHealthInfoController);
router.get('/:id', getHealthInfoByIdController);

router.post('/', authorize('admin'), validate(createHealthInfoSchema), createHealthInfoController);

router.patch(
  '/:id',
  authorize('admin'),
  validate(updateHealthInfoSchema),
  updateHealthInfoController
);

router.delete('/:id', authorize('admin'), deleteHealthInfoController);

export default router;
