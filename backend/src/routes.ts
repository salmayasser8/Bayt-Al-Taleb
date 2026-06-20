import { Router } from 'express';
import type { Container } from './container.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createUsersRouter } from './modules/users/users.routes.js';

/**
 * Builds the versioned API router (/api/v1).
 * Mount a new module by adding one line here.
 */
export function createApiRouter(container: Container): Router {
  const router = Router();

  router.use('/auth', createAuthRouter(container.authController));
  router.use('/users', createUsersRouter(container.usersController, container.tokenService));
  // TODO: mount remaining modules as implemented
  // router.use('/roles',        createRolesRouter(container.rolesController));
  // router.use('/majors',       createMajorsRouter(container.majorsController));
  // router.use('/scholarships', createScholarshipsRouter(container.scholarshipsController));
  // router.use('/files',        createFilesRouter(container.filesController));
  // router.use('/content',      createContentRouter(container.contentController));
  // router.use('/search',       createSearchRouter(container.searchController));
  // router.use('/contact',      createContactRouter(container.contactController));

  return router;
}