import { Router } from 'express';
import { env } from './config/env.js';
import type { Container } from './container.js';

import { authenticate } from './infrastructure/http/middlewares/auth.middleware.js';

import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createUsersRouter } from './modules/users/users.routes.js';
import { createRolesRouter } from './modules/roles/roles.routes.js';
import { createCollegesRouter } from './modules/colleges/colleges.routes.js';
import { createMajorsRouter } from './modules/majors/majors.routes.js';
import { createScholarshipsRouter } from './modules/scholarships/scholarships.routes.js';
import { createContentRouter } from './modules/content/content.routes.js';
import { createDeletedItemsRouter } from './modules/deleted-items/deleted-items.routes.js';
import { createSearchRouter } from './modules/search/search.routes.js';
import { createFilesRouter } from './modules/files/files.routes.js';
import { createUploadMiddleware } from './infrastructure/http/middlewares/upload.middleware.js';
import { createReviewsRouter } from './modules/reviews/reviews.routes.js';
import { createContactRouter } from './modules/contact/contact.routes.js';
import { createNotificationsRouter } from './modules/notifications/notifications.routes.js';
import { createAuditRouter } from './modules/audit/audit.routes.js';
import { createCoursesRouter } from './modules/courses/courses.routes.js';
import { createModeratorsRouter } from './modules/moderators/moderators.routes.js';
/**
 * Builds the versioned API router (/api/v1).
 * Mount a new module by adding one line here.
 */
export function createApiRouter(container: Container): Router {
  const router = Router();

  const authMiddleware = authenticate(container.tokenService);
  const uploadMiddleware = createUploadMiddleware(Number(env.MAX_FILE_SIZE_MB));
  router.use('/auth', createAuthRouter(container.authController, authMiddleware));
  router.use('/search', createSearchRouter(container.searchController));

  router.use('/users', createUsersRouter(container.usersController, container.tokenService));

  router.use('/roles', createRolesRouter(container.rolesController, container.tokenService));

  router.use(
    '/scholarships',
    createScholarshipsRouter(container.scholarshipsController, container.tokenService),
  );

  router.use(
    '/deleted-items',
    createDeletedItemsRouter(container.deletedItemsController, container.tokenService),
  );

  router.use('/majors', createMajorsRouter(container.majorsController, authMiddleware));

  router.use('/colleges', createCollegesRouter(container.collegesController, authMiddleware));

  router.use('/content', createContentRouter(container.contentController, authMiddleware));

  router.use(
    '/files',
    createFilesRouter(container.filesController, authMiddleware, uploadMiddleware),
  );

  router.use(
    '/files/:fileId/reviews',
    createReviewsRouter(container.reviewsController, container.authenticate),
  );

  router.use('/contact', createContactRouter(container.contactController, authMiddleware));

  router.use(
    '/notifications',
    createNotificationsRouter(container.notificationsController, authMiddleware),
  );

  router.use('/audit-logs', createAuditRouter(container.auditController, authMiddleware));

  router.use(createCoursesRouter(container.coursesController, authMiddleware));

  router.use(
    '/moderators',
    createModeratorsRouter(container.moderatorsController, container.authenticate),
  );

  return router;
}
