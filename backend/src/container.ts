/**
 * Composition root — builds the entire object graph once.
 * Every class receives its dependencies via constructor injection.
 * No service ever calls `new` on another service.
 *
 * Pass a `db` override to use a stub database in integration tests.
 */

import { prisma } from './infrastructure/database/prisma.js';
import type { Database } from './infrastructure/database/prisma.js';
import { env } from './config/env.js';
import { authenticate } from './infrastructure/http/middlewares/auth.middleware.js';
import type { RequestHandler } from 'express';

// ── Auth ──────────────────────────────────────────────────────
import { AuthRepository }       from './modules/auth/auth.repository.js';
import { AuthService }          from './modules/auth/auth.service.js';
import { AuthController }       from './modules/auth/auth.controller.js';
import { BcryptPasswordHasher } from './modules/auth/bcrypt-password.hasher.js';
import { JwtTokenService }      from './modules/auth/jwt-token.service.js';

// ── Authorization ─────────────────────────────────────────────
import { AuthorizationRepository } from './modules/authorization/authorization.repository.js';
import { AuthorizationService }    from './modules/authorization/authorization.service.js';

// ── Audit ─────────────────────────────────────────────────────
import { AuditRepository } from './modules/audit/audit.repository.js';
import { AuditService }    from './modules/audit/audit.service.js';

// ── Users ─────────────────────────────────────────────────────
import { UsersRepository }  from './modules/users/users.repository.js';
import { UsersService }     from './modules/users/users.service.js';
import { UsersController }  from './modules/users/users.controller.js';

// ── Roles ─────────────────────────────────────────────────────
import { RolesRepository }  from './modules/roles/roles.repository.js';
import { RolesService }     from './modules/roles/roles.service.js';
import { RolesController }  from './modules/roles/roles.controller.js';

// ── Scholarships ──────────────────────────────────────────────
import { ScholarshipsRepository } from './modules/scholarships/scholarships.repository.js';
import { ScholarshipsService }    from './modules/scholarships/scholarships.service.js';
import { ScholarshipsController } from './modules/scholarships/scholarships.controller.js';

// ── Deleted Items ─────────────────────────────────────────────
import { DeletedItemsService }    from './modules/deleted-items/deleted-items.service.js';
import { DeletedItemsController } from './modules/deleted-items/deleted-items.controller.js';

export interface Container {
  // Middleware
  authenticate: RequestHandler;

  // Auth
  authController:         AuthController;

  // Users & Roles
  usersController:        UsersController;
  rolesController:        RolesController;

  // Scholarships
  scholarshipsController: ScholarshipsController;

  // Deleted Items
  deletedItemsController: DeletedItemsController;

  // Token service (used by routes that need it directly)
  tokenService:           JwtTokenService;
}

export function buildContainer(db: Database = prisma): Container {

  // ── Shared infrastructure ──────────────────────────────────
  const hasher = new BcryptPasswordHasher(env.BCRYPT_SALT_ROUNDS);

  const tokenService = new JwtTokenService({
    accessSecret:     env.JWT_ACCESS_SECRET,
    refreshSecret:    env.JWT_REFRESH_SECRET,
    accessExpiresIn:  env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  const authMiddleware = authenticate(tokenService);

  // ── Auth ──────────────────────────────────────────────────
  const authRepo       = new AuthRepository(db);
  const refreshTtlMs   = 7 * 24 * 60 * 60 * 1000; // 7 days
  const authService    = new AuthService(authRepo, hasher, tokenService, refreshTtlMs);
  const authController = new AuthController(authService);

  // ── Authorization ─────────────────────────────────────────
  const authzRepo    = new AuthorizationRepository(db);
  const authzService = new AuthorizationService(authzRepo);

  // ── Audit ─────────────────────────────────────────────────
  const auditRepo    = new AuditRepository(db);
  const auditService = new AuditService(auditRepo);

  // suppress unused-var warnings for services wired but not yet in Container
  void authzService;
  void auditService;

  // ── Users ─────────────────────────────────────────────────
  const usersRepo       = new UsersRepository(db);
  const usersService    = new UsersService(usersRepo, hasher);
  const usersController = new UsersController(usersService);

  // ── Roles ─────────────────────────────────────────────────
  const rolesRepo       = new RolesRepository(db);
  const rolesService    = new RolesService(rolesRepo);
  const rolesController = new RolesController(rolesService);

  // ── Scholarships ──────────────────────────────────────────
  const scholarshipsRepo       = new ScholarshipsRepository(db);
  const scholarshipsService    = new ScholarshipsService(scholarshipsRepo);
  const scholarshipsController = new ScholarshipsController(scholarshipsService);

  // ── Deleted Items ─────────────────────────────────────────
  const deletedItemsService    = new DeletedItemsService(prisma);
  const deletedItemsController = new DeletedItemsController(deletedItemsService);

  return {
    authenticate: authMiddleware,
    authController,
    usersController,
    rolesController,
    scholarshipsController,
    deletedItemsController,
    tokenService,
  };
}