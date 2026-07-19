import { Request, Response } from 'express';
import * as notificationsService from './notifications.service';
import { successResponse, errorResponse } from '../../utils/apiResponse.util';

/**
 * @swagger
 * /api/notifications/me:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notifications for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
export async function getMyNotificationsController(req: Request, res: Response): Promise<void> {
  try {
    const notifications = await notificationsService.getMyNotifications(req.user!.userId);
    successResponse(res, notifications);
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
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
 *         description: Notification marked as read
 *       403:
 *         description: Access denied
 *       404:
 *         description: Notification not found
 */
export async function markNotificationReadController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const notification = await notificationsService.markNotificationRead(
      req.params.id,
      req.user!.userId
    );
    successResponse(res, notification, 200, 'Notification marked as read');
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === 'Access denied') {
      errorResponse(res, msg, 403);
    } else {
      errorResponse(res, msg, 404);
    }
  }
}

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
export async function markAllReadController(req: Request, res: Response): Promise<void> {
  try {
    await notificationsService.markAllNotificationsRead(req.user!.userId);
    successResponse(res, null, 200, 'All notifications marked as read');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}
