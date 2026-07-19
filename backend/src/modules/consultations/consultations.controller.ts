import { Request, Response } from 'express';
import * as consultationsService from './consultations.service';
import { successResponse, errorResponse } from '../../utils/apiResponse.util';

/**
 * @swagger
 * /api/consultations:
 *   post:
 *     tags: [Consultations]
 *     summary: Create a new consultation for an appointment (Doctor only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId]
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *                 example: "Patient presents with mild fever. Prescribed paracetamol."
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed]
 *                 default: not_started
 *     responses:
 *       201:
 *         description: Consultation created
 *       400:
 *         description: Consultation already exists or invalid appointment
 *       403:
 *         description: Not authorized
 */
export async function createConsultationController(req: Request, res: Response): Promise<void> {
  try {
    const consultation = await consultationsService.createConsultation(
      req.user!.userId,
      req.body
    );
    successResponse(res, consultation, 201, 'Consultation created');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/consultations/{id}:
 *   patch:
 *     tags: [Consultations]
 *     summary: Update consultation notes and status (Doctor only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Consultation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed]
 *     responses:
 *       200:
 *         description: Consultation updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Consultation not found
 */
export async function updateConsultationController(req: Request, res: Response): Promise<void> {
  try {
    const consultation = await consultationsService.updateConsultation(
      req.params.id,
      req.user!.userId,
      req.body
    );
    successResponse(res, consultation, 200, 'Consultation updated');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/consultations/me:
 *   get:
 *     tags: [Consultations]
 *     summary: Get all consultations for the current patient or doctor
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of consultations
 */
export async function getMyConsultationsController(req: Request, res: Response): Promise<void> {
  try {
    const consultations = await consultationsService.getMyConsultations(
      req.user!.userId,
      req.user!.role
    );
    successResponse(res, consultations);
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/consultations/{appointmentId}:
 *   get:
 *     tags: [Consultations]
 *     summary: Get consultation by appointment ID (Patient/Doctor)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Consultation details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Consultation not found
 */
export async function getConsultationController(req: Request, res: Response): Promise<void> {
  try {
    const consultation = await consultationsService.getConsultationByAppointment(
      req.params.appointmentId,
      req.user!.userId,
      req.user!.role
    );
    successResponse(res, consultation);
  } catch (error) {
    errorResponse(res, (error as Error).message, 404);
  }
}

/**
 * @swagger
 * /api/consultations/{appointmentId}/video:
 *   post:
 *     tags: [Consultations]
 *     summary: Get or create the video call room for an appointment (Patient/Doctor)
 *     description: >
 *       Doctors start the call - the consultation is created (or promoted to
 *       in_progress) with an unguessable Jitsi room name and the patient is
 *       notified. Patients can only join once the doctor has started the call.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Consultation including videoRoomId
 *       400:
 *         description: Call not available (not confirmed, not started yet, completed, or not authorized)
 */
export async function getOrCreateVideoRoomController(req: Request, res: Response): Promise<void> {
  try {
    const consultation = await consultationsService.getOrCreateVideoRoom(
      req.params.appointmentId,
      req.user!.userId,
      req.user!.role
    );
    successResponse(res, consultation);
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}
