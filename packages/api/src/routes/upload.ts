import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload.js';
import { sendSuccess, sendError } from '../utils/response.js';

export function createUploadRoutes(): Router {
  const router = Router();

  // POST /api/upload - Upload an image
  router.post('/', upload.single('image'), (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return sendError(res, 'NO_FILE_PROVIDED', 'No image file provided', 400);
      }

      const url = `/uploads/${req.file.filename}`;
      return sendSuccess(res, { url }, 201);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
