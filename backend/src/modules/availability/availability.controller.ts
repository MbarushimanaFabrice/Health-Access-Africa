import { Request, Response } from 'express';
import * as availabilityService from './availability.service';
import { successResponse, errorResponse } from '../../utils/apiResponse.util';

/**
 * @swagger
 * /api/availability:
 *   post:
 *     tags: [Availability]
 *     summary: Create availability slots for multiple days and times (Doctor only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dates, times]
 *             properties:
 *               dates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *                 example: ["2026-08-03", "2026-08-04"]
 *               times:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["09:00", "10:00"]
 *     responses:
 *       201:
 *         description: Slots created (existing duplicates are skipped)
 *       403:
 *         description: Only doctors can create availability slots
 */
export async function createSlotsController(req: Request, res: Response): Promise<void> {
  try {
    const result = await availabilityService.createSlots(req.user!.userId, req.body);
    successResponse(res, result, 201, 'Availability slots created');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/availability/me:
 *   get:
 *     tags: [Availability]
 *     summary: Get my upcoming availability slots, booked and open (Doctor only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of availability slots
 */
export async function getMySlotsController(req: Request, res: Response): Promise<void> {
  try {
    const slots = await availabilityService.getMySlots(req.user!.userId);
    successResponse(res, slots);
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/availability/doctor/{doctorId}:
 *   get:
 *     tags: [Availability]
 *     summary: Get a doctor's open (unbooked) upcoming slots
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of open slots
 *       400:
 *         description: Doctor not found
 */
export async function getAvailableSlotsController(req: Request, res: Response): Promise<void> {
  try {
    const slots = await availabilityService.getAvailableSlots(req.params.doctorId);
    successResponse(res, slots);
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/availability/{id}:
 *   delete:
 *     tags: [Availability]
 *     summary: Remove an unbooked availability slot (Doctor only)
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
 *         description: Slot removed
 *       400:
 *         description: Slot is booked or does not belong to you
 */
export async function deleteSlotController(req: Request, res: Response): Promise<void> {
  try {
    await availabilityService.deleteSlot(req.params.id, req.user!.userId);
    successResponse(res, null, 200, 'Availability slot removed');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}
