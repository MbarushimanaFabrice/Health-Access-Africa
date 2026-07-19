import { Response } from 'express';

interface ApiResponseOptions {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export function apiResponse(
  res: Response,
  statusCode: number,
  options: ApiResponseOptions
): Response {
  const body: Record<string, unknown> = {
    success: options.success,
  };

  if (options.message !== undefined) body.message = options.message;
  if (options.data !== undefined) body.data = options.data;
  if (options.error !== undefined) body.error = options.error;

  return res.status(statusCode).json(body);
}

export function successResponse(
  res: Response,
  data: unknown,
  statusCode = 200,
  message?: string
): Response {
  return apiResponse(res, statusCode, { success: true, data, message });
}

export function errorResponse(
  res: Response,
  error: string,
  statusCode = 400
): Response {
  return apiResponse(res, statusCode, { success: false, error });
}
