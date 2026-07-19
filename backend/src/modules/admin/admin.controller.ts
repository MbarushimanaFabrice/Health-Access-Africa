import { Request, Response } from 'express';
import * as adminService from './admin.service';
import { successResponse, errorResponse } from '../../utils/apiResponse.util';

/**
 * @swagger
 * /api/admin/doctors:
 *   post:
 *     tags: [Admin]
 *     summary: Create a doctor account (Admin only) — the only way to create a doctor
 *     description: >
 *       Doctors cannot self-register. The admin supplies the doctor's profile info and
 *       an optional temporary password; if omitted, an 8-character temporary password is
 *       generated. The new account is created with mustChangePassword=true so the doctor
 *       is forced to set a real password on first login. The temporary password is
 *       returned in plaintext exactly once — it is not recoverable afterward.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Dr. Uwimana Claude
 *               email:
 *                 type: string
 *                 format: email
 *                 example: dr.uwimana@healthaccessafrica.rw
 *               phone:
 *                 type: string
 *                 example: "+250788000099"
 *               district:
 *                 type: string
 *                 example: Kigali
 *               specialty:
 *                 type: string
 *                 example: Cardiology
 *               hospital:
 *                 type: string
 *                 example: King Faisal Hospital Kigali
 *               yearsExperience:
 *                 type: integer
 *                 example: 6
 *               temporaryPassword:
 *                 type: string
 *                 description: Optional — auto-generated if omitted
 *                 example: Xk29pLq1
 *     responses:
 *       201:
 *         description: Doctor account created; response includes the plaintext temporaryPassword once
 *       400:
 *         description: Email already registered
 */
export async function createDoctorController(req: Request, res: Response): Promise<void> {
  try {
    const result = await adminService.createDoctor(req.body);
    successResponse(res, result, 201, 'Doctor account created successfully');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/admin/appointments:
 *   get:
 *     tags: [Admin]
 *     summary: Get all appointments system-wide, read-only (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of all appointments
 */
export async function getAllAppointmentsController(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.query as { status?: string };
    const appointments = await adminService.getAllAppointments(status);
    successResponse(res, appointments);
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [patient, doctor, admin]
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Admin only
 */
export async function getAllUsersController(req: Request, res: Response): Promise<void> {
  try {
    const { role, isActive } = req.query as { role?: string; isActive?: string };
    const isActiveBoolean =
      isActive !== undefined ? isActive === 'true' : undefined;
    const users = await adminService.getAllUsers(role, isActiveBoolean);
    successResponse(res, users);
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Activate or deactivate a user (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: User status updated
 *       404:
 *         description: User not found
 */
export async function updateUserStatusController(req: Request, res: Response): Promise<void> {
  try {
    const { isActive } = req.body as { isActive: boolean };
    if (typeof isActive !== 'boolean') {
      errorResponse(res, 'isActive must be a boolean value', 422);
      return;
    }
    const user = await adminService.updateUserStatus(req.params.id, isActive);
    successResponse(res, user, 200, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    errorResponse(res, (error as Error).message, 404);
  }
}

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user (Admin only — cannot delete admin accounts)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete admin accounts
 *       404:
 *         description: User not found
 */
export async function deleteUserController(req: Request, res: Response): Promise<void> {
  try {
    await adminService.deleteUser(req.params.id);
    successResponse(res, null, 200, 'User deleted successfully');
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === 'Cannot delete admin accounts') {
      errorResponse(res, msg, 400);
    } else {
      errorResponse(res, msg, 404);
    }
  }
}

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get system-wide statistics (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                     appointments:
 *                       type: object
 *                     consultations:
 *                       type: object
 *                     healthInfo:
 *                       type: object
 *                     notifications:
 *                       type: object
 *                     recentAppointments:
 *                       type: array
 */
export async function getStatsController(req: Request, res: Response): Promise<void> {
  try {
    const stats = await adminService.getSystemStats();
    successResponse(res, stats);
  } catch (error) {
    errorResponse(res, (error as Error).message, 500);
  }
}
