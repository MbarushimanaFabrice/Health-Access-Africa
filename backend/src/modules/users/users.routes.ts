import { Router } from 'express';
import {
  getUserByIdController,
  listUsersController,
  updateMeController,
} from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePasswordChange } from '../../middleware/requirePasswordChange.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateMeSchema } from './users.schema';

const router = Router();

router.use(authenticate, requirePasswordChange);

router.get('/', listUsersController);
router.patch('/me', validate(updateMeSchema), updateMeController);
router.get('/:id', getUserByIdController);

export default router;
