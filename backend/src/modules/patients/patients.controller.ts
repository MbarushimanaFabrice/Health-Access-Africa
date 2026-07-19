import { Request, Response } from 'express';
import * as patientsService from './patients.service';
import { successResponse, errorResponse } from '../../utils/apiResponse.util';

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient medical profile (Doctor/Admin, or Patient viewing own)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient user ID
 *     responses:
 *       200:
 *         description: Patient profile
 *       403:
 *         description: Access denied
 *       404:
 *         description: Patient not found
 */
export async function getPatientController(req: Request, res: Response): Promise<void> {
  try {
    const patient = await patientsService.getPatientById(
      req.params.id,
      req.user!.userId,
      req.user!.role
    );
    successResponse(res, patient);
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === 'Access denied' || msg.startsWith('Access denied:')) {
      errorResponse(res, msg, 403);
    } else {
      errorResponse(res, msg, 404);
    }
  }
}

/**
 * @swagger
 * /api/patients/{id}:
 *   patch:
 *     tags: [Patients]
 *     summary: Update patient medical profile (Doctor assigned / Patient self)
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
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               district:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1995-03-15"
 *               gender:
 *                 type: string
 *                 example: Female
 *               allergies:
 *                 type: string
 *               chronicConditions:
 *                 type: string
 *               notes:
 *                 type: string
 *                 description: Doctor notes (doctors typically write this)
 *     responses:
 *       200:
 *         description: Patient profile updated
 *       403:
 *         description: Access denied
 */
export async function updatePatientController(req: Request, res: Response): Promise<void> {
  try {
    const patient = await patientsService.updatePatientProfile(
      req.params.id,
      req.user!.userId,
      req.user!.role,
      req.body
    );
    successResponse(res, patient, 200, 'Patient profile updated');
  } catch (error) {
    const msg = (error as Error).message;
    if (msg.startsWith('Access denied') || msg.startsWith('You can only')) {
      errorResponse(res, msg, 403);
    } else {
      errorResponse(res, msg, 400);
    }
  }
}
