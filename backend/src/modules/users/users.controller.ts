import { Request, Response } from 'express';
import * as usersService from './users.service';
import { successResponse, errorResponse } from '../../utils/apiResponse.util';

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update your own profile (any authenticated role)
 *     description: >
 *       Updates base user fields (fullName/email/phone/district). For doctors, also
 *       accepts specialty/hospital/bio/yearsExperience which upsert the DoctorProfile.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               district:
 *                 type: string
 *               specialty:
 *                 type: string
 *               hospital:
 *                 type: string
 *               bio:
 *                 type: string
 *               yearsExperience:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated profile
 *       400:
 *         description: Email already registered
 */
export async function updateMeController(req: Request, res: Response): Promise<void> {
  try {
    const user = await usersService.updateMe(req.user!.userId, req.user!.role, req.body);
    successResponse(res, user, 200, 'Profile updated');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
export async function getUserByIdController(req: Request, res: Response): Promise<void> {
  try {
    const user = await usersService.getUserById(req.params.id);
    successResponse(res, user);
  } catch (error) {
    errorResponse(res, (error as Error).message, 404);
  }
}

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (optionally filtered by role)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [patient, doctor, admin]
 *         description: Filter users by role (e.g. ?role=doctor)
 *     responses:
 *       200:
 *         description: List of users
 */
export async function listUsersController(req: Request, res: Response): Promise<void> {
  try {
    const { role } = req.query as { role?: string };
    const users = await usersService.listUsers(role);
    successResponse(res, users);
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}
