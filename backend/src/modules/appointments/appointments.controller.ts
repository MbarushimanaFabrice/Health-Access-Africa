import { Request, Response } from 'express';
import * as appointmentsService from './appointments.service';
import { successResponse, errorResponse } from '../../utils/apiResponse.util';

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Book a new appointment (Patient only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, appointmentDate, appointmentTime]
 *             properties:
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the doctor
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-09-15"
 *               appointmentTime:
 *                 type: string
 *                 example: "09:00"
 *               reason:
 *                 type: string
 *                 example: "Routine checkup"
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       403:
 *         description: Only patients can book appointments
 */
export async function createAppointmentController(req: Request, res: Response): Promise<void> {
  try {
    const appointment = await appointmentsService.createAppointment(
      req.user!.userId,
      req.body
    );
    successResponse(res, appointment, 201, 'Appointment booked successfully');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/appointments/me:
 *   get:
 *     tags: [Appointments]
 *     summary: Get my appointments (Patient sees own, Doctor sees assigned)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 */
export async function getMyAppointmentsController(req: Request, res: Response): Promise<void> {
  try {
    const appointments = await appointmentsService.getMyAppointments(
      req.user!.userId,
      req.user!.role
    );
    successResponse(res, appointments);
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     tags: [Appointments]
 *     summary: Update appointment status (Doctor can confirm/cancel/complete; Patient can only cancel own appointment)
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled, completed]
 *     responses:
 *       200:
 *         description: Appointment status updated
 *       403:
 *         description: Not authorized to manage this appointment
 *       404:
 *         description: Appointment not found
 */
export async function updateAppointmentStatusController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const appointment = await appointmentsService.updateAppointmentStatus(
      req.params.id,
      req.user!.userId,
      req.user!.role,
      req.body
    );
    successResponse(res, appointment, 200, 'Appointment status updated');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     tags: [Appointments]
 *     summary: Cancel/delete own pending appointment (Patient only)
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
 *         description: Appointment cancelled
 *       400:
 *         description: Only pending appointments can be cancelled
 *       403:
 *         description: Not your appointment
 */
export async function deleteAppointmentController(req: Request, res: Response): Promise<void> {
  try {
    await appointmentsService.deleteAppointment(req.params.id, req.user!.userId);
    successResponse(res, null, 200, 'Appointment cancelled successfully');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}
