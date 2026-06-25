import { prisma } from './infrastructure/database/prisma.js';
import { env } from './config/env.js';

import { AuthRepository }       from './modules/auth/auth.repository.js';
import { AuthService }          from './modules/auth/auth.service.js';
import { AuthController }       from './modules/auth/auth.controller.js';
import { BcryptPasswordHasher } from './modules/auth/bcrypt-password.hasher.js';
import { JwtTokenService }      from './modules/auth/jwt-token.service.js';

import { UsersRepository } from './modules/users/users.repository.js';
import { UsersService }    from './modules/users/users.service.js';
import { UsersController } from './modules/users/users.controller.js';

import { RolesRepository } from './modules/roles/roles.repository.js';
import { RolesService }    from './modules/roles/roles.service.js';
import { RolesController } from './modules/roles/roles.controller.js';

import { ScholarshipsRepository } from './modules/scholarships/scholarships.repository.js';
import { ScholarshipsService }    from './modules/scholarships/scholarships.service.js';
import { ScholarshipsController } from './modules/scholarships/scholarships.controller.js';

export interface Container {
  authController:         AuthController;
  usersController:        UsersController;
  rolesController:        RolesController;
  scholarshipsController: ScholarshipsController;
  tokenService:           JwtTokenService;
import { DeletedItemsService }    from './modules/deleted-items/deleted-items.service.js';
import { DeletedItemsController } from './modules/deleted-items/deleted-items.controller.js';

export interface Container {
  authController:          AuthController;
  usersController:         UsersController;
  rolesController:         RolesController;
  scholarshipsController:  ScholarshipsController;
  deletedItemsController:  DeletedItemsController;
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

  // Auth
  const authRepo       = new AuthRepository(prisma);
  const refreshTtlMs   = 7 * 24 * 60 * 60 * 1000;
  const authService    = new AuthService(authRepo, hasher, tokenService, refreshTtlMs);
  const authController = new AuthController(authService);

  // Users
  const usersRepo       = new UsersRepository(prisma);
  const usersService    = new UsersService(usersRepo, hasher);
  const usersController = new UsersController(usersService);

  // Roles
  const rolesRepo       = new RolesRepository(prisma);
  const rolesService    = new RolesService(rolesRepo);
  const rolesController = new RolesController(rolesService);

  // Scholarships
  const scholarshipsRepo       = new ScholarshipsRepository(prisma);
  const scholarshipsService    = new ScholarshipsService(scholarshipsRepo);
  const scholarshipsController = new ScholarshipsController(scholarshipsService);

  // Deleted Items
  const deletedItemsService    = new DeletedItemsService(prisma);
  const deletedItemsController = new DeletedItemsController(deletedItemsService);

  return {
    authController,
    usersController,
    rolesController,
    scholarshipsController,
    deletedItemsController,
    tokenService,
  };
}