/**
 * Composition root — builds the entire object graph once.
 * Every class receives its dependencies via constructor injection.
 * No service ever calls `new` on another service.
 */

import { prisma } from './infrastructure/database/prisma.js';
import { env } from './config/env.js';

// ── Auth ──────────────────────────────────────────────────────
import { AuthRepository }      from './modules/auth/auth.repository.js';
import { AuthService }         from './modules/auth/auth.service.js';
import { AuthController }      from './modules/auth/auth.controller.js';
import { BcryptPasswordHasher } from './modules/auth/bcrypt-password.hasher.js';
import { JwtTokenService }     from './modules/auth/jwt-token.service.js';

// ─────────────────────────────────────────────────────────────

export interface Container {
  // Auth
  authController: AuthController;
}

export function buildContainer(): Container {

  // ── Shared infrastructure ──────────────────────────────────
  const hasher = new BcryptPasswordHasher(env.BCRYPT_SALT_ROUNDS);

  const tokenService = new JwtTokenService({
    accessSecret:     env.JWT_ACCESS_SECRET,
    refreshSecret:    env.JWT_REFRESH_SECRET,
    accessExpiresIn:  env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  // ── Auth ──────────────────────────────────────────────────
  const authRepo       = new AuthRepository(prisma);
  const refreshTtlMs   = 7 * 24 * 60 * 60 * 1000; // 7 days
  const authService    = new AuthService(authRepo, hasher, tokenService, refreshTtlMs);
  const authController = new AuthController(authService);

  return { authController };
}