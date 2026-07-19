import { Router } from 'express';
import {
  getMyNotificationsController,
  markNotificationReadController,
  markAllReadController,
} from './notifications.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePasswordChange } from '../../middleware/requirePasswordChange.middleware';

const router = Router();

router.use(authenticate, requirePasswordChange);

router.get('/me', getMyNotificationsController);
router.patch('/read-all', markAllReadController);
router.patch('/:id/read', markNotificationReadController);

export default router;
