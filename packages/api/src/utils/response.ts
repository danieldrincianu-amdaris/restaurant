import { Response } from 'express';

export function sendSuccess(res: Response, data: any, status: number = 200) {
  return res.status(status).json({ data });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  status: number = 400
) {
  return res.status(status).json({
    error: {
      code,
      message,
    },
  });
}
