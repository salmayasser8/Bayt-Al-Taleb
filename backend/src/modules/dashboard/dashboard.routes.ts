import { Router } from 'express';
import type { DashboardController } from './dashboard.controller.js';
import type { TokenService } from '../auth/auth.types.js';
import { authenticate } from '../../infrastructure/http/middlewares/auth.middleware.js';
import { requirePermission } from '../../infrastructure/http/middlewares/role.guard.js';
import { PERMISSIONS } from '../../shared/rbac/permissions.js';

/**
 * Dashboard routes — mounted at /api/v1/dashboard
 *
 *   GET /stats            platform-wide counts   (users:read)
 *   GET /recent-activity  latest 10 per category (users:read)
 */
export function createDashboardRouter(
  controller: DashboardController,
  tokenService: TokenService,
): Router {
  const router = Router();
  const auth   = authenticate(tokenService);

  router.get(
    '/stats',
    auth,
    requirePermission(PERMISSIONS.USERS_READ),
    controller.getStats,
  );

  router.get(
    '/recent-activity',
    auth,
    requirePermission(PERMISSIONS.USERS_READ),
    controller.getRecentActivity,
  );

  return router;
}