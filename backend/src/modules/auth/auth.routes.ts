import { Router } from 'express';
import {
  registerController,
  loginController,
  getMeController,
  changePasswordController,
} from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.get('/me', authenticate, getMeController);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  changePasswordController
);

export default router;
