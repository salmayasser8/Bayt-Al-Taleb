import { Router, type RequestHandler } from 'express';
import {
  requirePermission,
  requireAnyPermission,
} from '../../infrastructure/http/middlewares/role.guard.js';
import { validate } from '../../infrastructure/http/middlewares/validate.js';
import { deleteReasonBodySchema } from '../../shared/soft-delete/delete-reason.schema.js';
import type { FilesController } from './files.controller.js';
import {
  uploadFileMetaSchema,
  fileIdParamsSchema,
  listFilesQuerySchema,
} from './files.validation.js';

export function createFilesRouter(
  controller: FilesController,
  authenticate: RequestHandler,
  uploadMiddleware: RequestHandler,
): Router {
  const router = Router();

  // ⬇️ PUBLIC ROUTE (No auth required) - Moved to the top! ⬇️
  router.get('/owner/:ownerType/:ownerId/approved', controller.getApprovedByOwner.bind(controller));
  // ⬆️ PUBLIC ROUTE ⬆️

  // POST / — multipart upload
  router.post(
    '/',
    authenticate,
    requirePermission('files:upload'),
    uploadMiddleware,
    validate({ body: uploadFileMetaSchema }),
    controller.upload.bind(controller),
  );

  // GET / — paginated list (Protected)
  router.get(
    '/',
    authenticate,
    requirePermission('files:read'),
    validate({ query: listFilesQuerySchema }),
    controller.list.bind(controller),
  );

  // GET /owner/:ownerType/:ownerId (Protected)
  router.get(
    '/owner/:ownerType/:ownerId',
    authenticate,
    requirePermission('files:read'),
    controller.getByOwner.bind(controller),
  );

  // GET /:fileId/download — BEFORE /:fileId
  router.get(
    '/:fileId/download',
    authenticate,
    requirePermission('files:read'),
    validate({ params: fileIdParamsSchema }),
    controller.download.bind(controller),
  );

  // GET /:fileId — single file
  router.get(
    '/:fileId',
    authenticate,
    requirePermission('files:read'),
    validate({ params: fileIdParamsSchema }),
    controller.getById.bind(controller),
  );

  // DELETE /:fileId — soft delete
  router.delete(
    '/:fileId',
    authenticate,
    requireAnyPermission('files:manage'),
    validate({ params: fileIdParamsSchema, body: deleteReasonBodySchema }),
    controller.remove.bind(controller),
  );

  return router;
}
