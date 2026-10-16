import { Router, type RequestHandler } from 'express';
import type { ModeratorsController } from './moderators.controller.js';
import { requirePermission } from '../../infrastructure/http/middlewares/role.guard.js';
import { PERMISSIONS } from '../../shared/rbac/permissions.js';

/**
 * Moderators routes — mounted at /api/v1/moderators
 *
 * Centralized moderator assignment management.
 * All routes require moderators:manage permission (ADMIN+ only).
 */
export function createModeratorsRouter(
  controller: ModeratorsController,
  authenticate: RequestHandler,
): Router {
  const router = Router();
  const auth = authenticate;

  // ── List all moderators (for dropdown) ──────────────────────
  router.get(
    '/',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.listModerators,
  );

  // ── List entities (for dropdowns) ───────────────────────────
  router.get(
    '/majors',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.listMajors,
  );

  router.get(
    '/scholarships',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.listScholarships,
  );

  router.get(
    '/courses',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.listCourses,
  );

  // ── Major assignments ───────────────────────────────────────
  router.get(
    '/major/:majorId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.getMajorModerators,
  );

  router.post(
    '/major/:majorId/user/:userId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.assignMajorModerator,
  );

  router.delete(
    '/major/:majorId/user/:userId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.removeMajorModerator,
  );

  // ── Scholarship assignments ─────────────────────────────────
  router.get(
    '/scholarship/:scholarshipId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.getScholarshipModerators,
  );

  router.post(
    '/scholarship/:scholarshipId/user/:userId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.assignScholarshipModerator,
  );

  router.delete(
    '/scholarship/:scholarshipId/user/:userId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.removeScholarshipModerator,
  );

  // ── Course assignments ──────────────────────────────────────
  router.get(
    '/course/:courseId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.getCourseModerators,
  );

  router.post(
    '/course/:courseId/user/:userId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.assignCourseModerator,
  );

  router.delete(
    '/course/:courseId/user/:userId',
    auth,
    requirePermission(PERMISSIONS.MODERATORS_MANAGE),
    controller.removeCourseModerator,
  );

  return router;
}
