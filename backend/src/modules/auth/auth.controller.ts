import { Request, Response } from 'express';
import * as authService from './auth.service';
import { successResponse, errorResponse } from '../../utils/apiResponse.util';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new patient account (self-registration is patient-only)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Uwase Aline
 *               email:
 *                 type: string
 *                 format: email
 *                 example: uwase.aline@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               phone:
 *                 type: string
 *                 example: "+250788100001"
 *               district:
 *                 type: string
 *                 example: Kigali
 *     responses:
 *       201:
 *         description: User registered successfully
 *       422:
 *         description: Validation error
 *       400:
 *         description: Email already registered
 */
export async function registerController(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.register(req.body);
    successResponse(res, result, 201, 'Registration successful');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive a JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@healthaccessafrica.rw
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful. Response includes `mustChangePassword` — when true, the client must redirect to the set-new-password flow before accessing any other route.
 *       401:
 *         description: Invalid credentials
 */
export async function loginController(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login(req.body);
    successResponse(res, result, 200, 'Login successful');
  } catch (error) {
    errorResponse(res, (error as Error).message, 401);
  }
}

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change your own password (also clears the mustChangePassword flag)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully, returns a fresh JWT with mustChangePassword=false
 *       400:
 *         description: Current password is incorrect
 */
export async function changePasswordController(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.changePassword(req.user!.userId, req.body);
    successResponse(res, result, 200, 'Password changed successfully');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
export async function getMeController(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.userId);
    successResponse(res, user);
  } catch (error) {
    errorResponse(res, (error as Error).message, 404);
  }
}
