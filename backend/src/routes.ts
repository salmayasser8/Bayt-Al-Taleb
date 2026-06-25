import { Router } from 'express';
import type { Container } from './container.js';
import { createAuthRouter }          from './modules/auth/auth.routes.js';
import { createCollegesRouter }      from './modules/colleges/colleges.routes.js';
import { createMajorsRouter }        from './modules/majors/majors.routes.js';
import { createNotificationsRouter } from './modules/notifications/notifications.routes.js';
import { createReviewsRouter }       from './modules/reviews/reviews.routes.js';

/**
 * Builds the versioned API router (/api/v1).
 * Mount a new module by adding one line here.
 */
export function createApiRouter(container: Container): Router {
  const router = Router();

  router.use('/auth',          createAuthRouter(container.authController));
  router.use('/colleges',      createCollegesRouter(container.collegesController, container.authenticate));
  router.use('/majors',        createMajorsRouter(container.majorsController, container.authenticate));
  router.use('/notifications', createNotificationsRouter(container.notificationsController, container.authenticate));

  // Files sub-router: /files/:fileId/reviews
  const filesRouter = Router();
  filesRouter.use('/:fileId/reviews', createReviewsRouter(container.reviewsController, container.authenticate));
  router.use('/files', filesRouter);

  // TODO: mount remaining modules as implemented
  // router.use('/users',        createUsersRouter(container.usersController));
  // router.use('/roles',        createRolesRouter(container.rolesController));
  // router.use('/scholarships', createScholarshipsRouter(container.scholarshipsController));
  // router.use('/content',      createContentRouter(container.contentController));
  // router.use('/search',       createSearchRouter(container.searchController));
  // router.use('/contact',      createContactRouter(container.contactController));

  return router;
}