import { Request, Response } from 'express';
import * as healthInfoService from './health-info.service';
import { successResponse, errorResponse } from '../../utils/apiResponse.util';

/**
 * @swagger
 * /api/health-info:
 *   get:
 *     tags: [HealthInfo]
 *     summary: Get all health information articles (Authenticated)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (e.g. "Malaria Prevention")
 *     responses:
 *       200:
 *         description: List of health info articles
 */
export async function getAllHealthInfoController(req: Request, res: Response): Promise<void> {
  try {
    const { category } = req.query as { category?: string };
    const articles = await healthInfoService.getAllHealthInfo(category, req.user!.role);
    successResponse(res, articles);
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/health-info/{id}:
 *   get:
 *     tags: [HealthInfo]
 *     summary: Get a single health info article by ID
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
 *         description: Health info article
 *       404:
 *         description: Article not found
 */
export async function getHealthInfoByIdController(req: Request, res: Response): Promise<void> {
  try {
    const article = await healthInfoService.getHealthInfoById(req.params.id, req.user!.role);
    successResponse(res, article);
  } catch (error) {
    errorResponse(res, (error as Error).message, 404);
  }
}

/**
 * @swagger
 * /api/health-info:
 *   post:
 *     tags: [HealthInfo]
 *     summary: Create a new health info article (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Malaria Prevention in Rwanda"
 *               content:
 *                 type: string
 *                 example: "Detailed article content here..."
 *               category:
 *                 type: string
 *                 example: "Malaria Prevention"
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: published
 *     responses:
 *       201:
 *         description: Article created
 *       403:
 *         description: Admin only
 */
export async function createHealthInfoController(req: Request, res: Response): Promise<void> {
  try {
    const article = await healthInfoService.createHealthInfo(req.user!.userId, req.body);
    successResponse(res, article, 201, 'Health info article created');
  } catch (error) {
    errorResponse(res, (error as Error).message, 400);
  }
}

/**
 * @swagger
 * /api/health-info/{id}:
 *   patch:
 *     tags: [HealthInfo]
 *     summary: Update a health info article (Admin only)
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       200:
 *         description: Article updated
 *       404:
 *         description: Article not found
 */
export async function updateHealthInfoController(req: Request, res: Response): Promise<void> {
  try {
    const article = await healthInfoService.updateHealthInfo(req.params.id, req.body);
    successResponse(res, article, 200, 'Health info article updated');
  } catch (error) {
    errorResponse(res, (error as Error).message, 404);
  }
}

/**
 * @swagger
 * /api/health-info/{id}:
 *   delete:
 *     tags: [HealthInfo]
 *     summary: Delete a health info article (Admin only)
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
 *         description: Article deleted
 *       404:
 *         description: Article not found
 */
export async function deleteHealthInfoController(req: Request, res: Response): Promise<void> {
  try {
    await healthInfoService.deleteHealthInfo(req.params.id);
    successResponse(res, null, 200, 'Health info article deleted');
  } catch (error) {
    errorResponse(res, (error as Error).message, 404);
  }
}
