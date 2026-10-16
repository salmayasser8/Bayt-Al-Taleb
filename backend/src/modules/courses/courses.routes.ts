import { Router, type RequestHandler } from 'express';
import type { CoursesController } from './courses.controller.js';
import { requirePermission } from '../../infrastructure/http/middlewares/role.guard.js';
import { PERMISSIONS } from '../../shared/rbac/permissions.js';

/**
 * Courses routes — mounted at /api/v1
 *
 *   GET    /majors/:majorId/courses         (public or auth)
 *   POST   /majors/:majorId/courses         (majors:manage)
 *   PATCH  /courses/:id                     (majors:manage)
 *   DELETE /courses/:id                     (majors:manage)
 *   GET    /courses/:id/moderators          (moderators:manage)
 *   POST   /courses/:id/moderators/:userId  (moderators:manage)
 *   DELETE /courses/:id/moderators/:userId  (moderators:manage)
 */
export function createCoursesRouter(
  controller: CoursesController,
  authenticate: RequestHandler,
): Router {
  const router = Router();
  const auth = authenticate;

  // GET /majors/:majorId/courses — list courses for a major (can be public or auth-gated)
  router.get('/majors/:majorId/courses', controller.getByMajor.bind(controller));

  // POST /majors/:majorId/courses — create course (requires majors:manage)
  router.post(
    '/majors/:majorId/courses',
    auth,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    controller.create.bind(controller),
  );

  // PATCH /courses/:id — update course (requires majors:manage)
  router.patch(
    '/courses/:id',
    auth,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    controller.update.bind(controller),
  );

  // DELETE /courses/:id — delete course (requires majors:manage)
  router.delete(
    '/courses/:id',
    auth,
    requirePermission(PERMISSIONS.MAJORS_MANAGE),
    controller.delete.bind(controller),
  );

  // GET /courses/:id/moderators — list moderators assigned to a course
  router.get(
    '/courses/:id/moderators',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.getModeratorsList.bind(controller),
  );

  // POST /courses/:id/moderators/:userId — assign moderator to course
  router.post(
    '/courses/:id/moderators/:userId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.assignModerator.bind(controller),
  );

  // DELETE /courses/:id/moderators/:userId — remove moderator from course
  router.delete(
    '/courses/:id/moderators/:userId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.revokeModerator.bind(controller),
  );

  return router;
}
