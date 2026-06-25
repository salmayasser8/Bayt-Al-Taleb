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

// ── Colleges ──────────────────────────────────────────────────
import { CollegesRepository } from './modules/colleges/colleges.repository.js';
import { CollegesService }    from './modules/colleges/colleges.service.js';
import { CollegesController } from './modules/colleges/colleges.controller.js';

// ── Majors ────────────────────────────────────────────────────
import { MajorsRepository } from './modules/majors/majors.repository.js';
import { MajorsService }    from './modules/majors/majors.service.js';
import { MajorsController } from './modules/majors/majors.controller.js';

// ── Files ─────────────────────────────────────────────────────
import { FilesService } from './modules/files/files.service.js';

// ── Notifications ─────────────────────────────────────────────
import { NotificationsRepository } from './modules/notifications/notifications.repository.js';
import { NotificationService }     from './modules/notifications/notifications.service.js';
import { NotificationsController } from './modules/notifications/notifications.controller.js';

// ── Reviews ───────────────────────────────────────────────────
import { ReviewsRepository }  from './modules/reviews/reviews.repository.js';
import { ReviewsService }     from './modules/reviews/reviews.service.js';
import { ReviewsController }  from './modules/reviews/reviews.controller.js';

export interface Container {
  // Middleware
  authenticate: RequestHandler;

  // Auth
  authController: AuthController;

  // Colleges
  collegesController: CollegesController;

  // Majors
  majorsController: MajorsController;

  // Notifications
  notificationsController: NotificationsController;

  // Reviews
  reviewsController: ReviewsController;
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

  // ── Majors (built before Colleges so Colleges can reference it) ───
  const majorsRepo       = new MajorsRepository(db);
  const majorsService    = new MajorsService(majorsRepo, authzService, auditService);
  const majorsController = new MajorsController(majorsService);

  // ── Colleges ──────────────────────────────────────────────
  const collegesRepo       = new CollegesRepository(db);
  const collegesService    = new CollegesService(collegesRepo, majorsService);
  const collegesController = new CollegesController(collegesService);

  // ── Notifications ─────────────────────────────────────────
  const notifRepo       = new NotificationsRepository(db);
  const notifService    = new NotificationService(notifRepo);
  const notifController = new NotificationsController(notifService);

  // ── Files (minimal — satisfies FileStatusUpdater for reviews) ──
  const filesService = new FilesService(db);

  // ── Reviews ───────────────────────────────────────────────
  const reviewsRepo       = new ReviewsRepository(db);
  const reviewsService    = new ReviewsService(reviewsRepo, filesService, auditService, notifService);
  const reviewsController = new ReviewsController(reviewsService);

  // ── Cross-module wiring ────────────────────────────────────
  // MajorsService needs to verify a college exists before creating a major.
  majorsService.registerCollegeChecker(collegesRepo);

  return {
    authenticate: authMiddleware,
    authController,
    collegesController,
    majorsController,
    notificationsController: notifController,
    reviewsController,
  };
}