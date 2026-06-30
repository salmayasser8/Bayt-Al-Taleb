/**
 * Composition root — builds the entire object graph once.
 */

import { prisma } from './infrastructure/database/prisma.js';
import { env } from './config/env.js';
import { authenticate } from './infrastructure/http/middlewares/auth.middleware.js';
import type { RequestHandler } from 'express';

import { AuthRepository }       from './modules/auth/auth.repository.js';
import { AuthService }          from './modules/auth/auth.service.js';
import { AuthController }       from './modules/auth/auth.controller.js';
import { BcryptPasswordHasher } from './modules/auth/bcrypt-password.hasher.js';
import { JwtTokenService }      from './modules/auth/jwt-token.service.js';

import { AuthorizationRepository } from './modules/authorization/authorization.repository.js';
import { AuthorizationService }    from './modules/authorization/authorization.service.js';

import { AuditRepository } from './modules/audit/audit.repository.js';
import { AuditService }    from './modules/audit/audit.service.js';

import { UsersRepository } from './modules/users/users.repository.js';
import { UsersService }    from './modules/users/users.service.js';
import { UsersController } from './modules/users/users.controller.js';

import { RolesRepository } from './modules/roles/roles.repository.js';
import { RolesService }    from './modules/roles/roles.service.js';
import { RolesController } from './modules/roles/roles.controller.js';

import { CollegesRepository } from './modules/colleges/colleges.repository.js';
import { CollegesService }    from './modules/colleges/colleges.service.js';
import { CollegesController } from './modules/colleges/colleges.controller.js';

import { MajorsRepository } from './modules/majors/majors.repository.js';
import { MajorsService }    from './modules/majors/majors.service.js';
import { MajorsController } from './modules/majors/majors.controller.js';

import { ScholarshipsRepository } from './modules/scholarships/scholarships.repository.js';
import { ScholarshipsService }    from './modules/scholarships/scholarships.service.js';
import { ScholarshipsController } from './modules/scholarships/scholarships.controller.js';

import { ContentRepository } from './modules/content/content.repository.js';
import { ContentService }    from './modules/content/content.service.js';
import { ContentController } from './modules/content/content.controller.js';

import { DeletedItemsService }    from './modules/deleted-items/deleted-items.service.js';
import { DeletedItemsController } from './modules/deleted-items/deleted-items.controller.js';

import { LocalStorageProvider } from './infrastructure/storage/local-storage.provider.js';
import { FilesRepository }      from './modules/files/files.repository.js';
import { FilesService }         from './modules/files/files.service.js';
import { FilesController }      from './modules/files/files.controller.js';

import { PostgresSearchProvider } from './modules/search/postgres-search.provider.js';
import { SearchService }          from './modules/search/search.service.js';
import { SearchController }       from './modules/search/search.controller.js';

import { NotificationsRepository } from './modules/notifications/notifications.repository.js';
import { NotificationService }     from './modules/notifications/notifications.service.js';
import { ReviewsRepository }       from './modules/reviews/reviews.repository.js';
import { ReviewsService }          from './modules/reviews/reviews.service.js';
import { ReviewsController }       from './modules/reviews/reviews.controller.js';

 import { ContactRepository } from './modules/contact/contact.repository.js';
import { ContactService } from './modules/contact/contact.service.js';
import { ContactController } from './modules/contact/contact.controller.js';
import { NotificationsController } from './modules/notifications/notifications.controller.js';

import { AuditController } from './modules/audit/audit.controller.js';
export interface Container {
  authenticate:            RequestHandler;
  authController:          AuthController;
  usersController:         UsersController;
  rolesController:         RolesController;
  collegesController:      CollegesController;
  majorsController:        MajorsController;
  scholarshipsController:  ScholarshipsController;
  contentController:       ContentController;
  deletedItemsController:  DeletedItemsController;
  filesController:         FilesController;
  searchController:        SearchController;
  reviewsController:       ReviewsController;
  contactController:       ContactController;
  notificationsController: NotificationsController;
  auditController:         AuditController;
  tokenService:            JwtTokenService;
}

export function buildContainer(): Container {
  const hasher = new BcryptPasswordHasher(env.BCRYPT_SALT_ROUNDS);

  const tokenService = new JwtTokenService({
    accessSecret:     env.JWT_ACCESS_SECRET,
    refreshSecret:    env.JWT_REFRESH_SECRET,
    accessExpiresIn:  env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  const authMiddleware = authenticate(tokenService);

  // ── Auth ──────────────────────────────────────────────────
  const authRepo       = new AuthRepository(prisma);
  const refreshTtlMs   = 7 * 24 * 60 * 60 * 1000;
  const authService    = new AuthService(authRepo, hasher, tokenService, refreshTtlMs);
  const authController = new AuthController(authService);

  // ── Authorization ─────────────────────────────────────────
  const authzRepo    = new AuthorizationRepository(prisma);
  const authzService = new AuthorizationService(authzRepo);

  // ── Audit ─────────────────────────────────────────────────
  const auditRepo    = new AuditRepository(prisma);
  const auditService = new AuditService(auditRepo);

  // ── Users ─────────────────────────────────────────────────
  const usersRepo       = new UsersRepository(prisma);
  const usersService    = new UsersService(usersRepo, hasher);
  const usersController = new UsersController(usersService);

  // ── Roles ─────────────────────────────────────────────────
  const rolesRepo       = new RolesRepository(prisma);
  const rolesService    = new RolesService(rolesRepo);
  const rolesController = new RolesController(rolesService);

  // ── Majors (قبل Colleges عشان Colleges بتعتمد عليه) ──────
  const majorsRepo       = new MajorsRepository(prisma);
  const majorsService    = new MajorsService(majorsRepo, authzService, auditService);
  const majorsController = new MajorsController(majorsService);

  // ── Colleges ─────────────────────────────────────────────
  const collegesRepo       = new CollegesRepository(prisma);
  const collegesService    = new CollegesService(collegesRepo, majorsService);
  const collegesController = new CollegesController(collegesService);

  // ── Register college checker ──────────────────────────────
  majorsService.registerCollegeChecker({
    exists: (id: string) => collegesRepo.findById(id).then(c => c !== null),
  });

  // ── Scholarships ──────────────────────────────────────────
  const scholarshipsRepo       = new ScholarshipsRepository(prisma);
  const scholarshipsService    = new ScholarshipsService(scholarshipsRepo);
  const scholarshipsController = new ScholarshipsController(scholarshipsService);

  // ── Content ───────────────────────────────────────────────
  const contentRepo       = new ContentRepository(prisma);
  const contentService    = new ContentService(contentRepo, prisma);
  const contentController = new ContentController(contentService);

  // Audit _______________________________________
  const auditController = new AuditController(auditService);
  // ── Deleted Items ─────────────────────────────────────────
  const deletedItemsService    = new DeletedItemsService(prisma);
  const deletedItemsController = new DeletedItemsController(deletedItemsService);


 // ── Files ─────────────────────────────────────────────────────
const storageProvider = new LocalStorageProvider(env.UPLOAD_DIR);
const filesRepo       = new FilesRepository(prisma);
const filesService    = new FilesService(filesRepo, authzService, auditService, storageProvider);
filesService.registerOwnerChecker('MAJOR',       majorsService);
filesService.registerOwnerChecker('SCHOLARSHIP', scholarshipsService);
const filesController = new FilesController(filesService, storageProvider);

  // ── Search ────────────────────────────────────────────────
  const searchProvider   = new PostgresSearchProvider(prisma);
  const searchService    = new SearchService(searchProvider);
  const searchController = new SearchController(searchService);
  
  // ── Contact ────────────────────────────────────────────────
const contactRepo = new ContactRepository(prisma);

const contactService = new ContactService(
  contactRepo,
  auditService,
);
const contactController = new ContactController(contactService);
  // ── Notifications ─────────────────────────────────────────────
const notificationsRepo    = new NotificationsRepository(prisma);
const notificationService  = new NotificationService(notificationsRepo);
const notificationsController =
  new NotificationsController(notificationService);

// ── Reviews ───────────────────────────────────────────────────
const reviewsRepo = new ReviewsRepository(prisma);
const reviewsService = new ReviewsService(
  reviewsRepo,
  {
    assertCanManageFile: (actor, fileId) => filesService.assertCanManageFile(actor, fileId),
    applyReviewStatus:   (fileId, status) => filesService.applyReviewStatus(fileId, status).then(() => undefined),
  },
  auditService,
  notificationService,
);
const reviewsController = new ReviewsController(reviewsService);
  // suppress unused warnings
  void authService; void authzService; void auditService;
  void rolesService; void usersService; void majorsService;
  void scholarshipsService; void searchService;

  return {
    authenticate:           authMiddleware,
    authController,
    usersController,
    rolesController,
    collegesController,
    majorsController,
    scholarshipsController,
    contentController,
    deletedItemsController,
    filesController,
    searchController,
    reviewsController,
    contactController,
     notificationsController,
     auditController,
    tokenService,
  };
}