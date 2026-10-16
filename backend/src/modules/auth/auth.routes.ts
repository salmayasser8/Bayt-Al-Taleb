/**
 * Auth routes. Mounted at `/api/v1/auth`.
 * Receives the controller via DI so routing has zero construction logic.
 *
 *   POST /register   public
 *   POST /login      public
 *   POST /refresh    public (presents refresh token)
 *   POST /logout     public (revokes refresh token)
 *   POST /verify-otp public (completes 2FA login)
 *   POST /2fa/setup|confirm|disable   authenticated
 */

import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { AuthController } from './auth.controller.js';
import { validate } from '../../infrastructure/http/middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  verifyOtpSchema,
  twoFactorCodeSchema,
} from './auth.validation.js';

export function createAuthRouter(
  controller: AuthController,
  authenticate: RequestHandler,
): Router {
  const router = Router();

  router.post('/register', validate({ body: registerSchema }), controller.register);
  router.post('/login',    validate({ body: loginSchema }),    controller.login);
  router.post('/refresh',  validate({ body: refreshSchema }),  controller.refresh);
  router.post('/logout',   validate({ body: logoutSchema }),   controller.logout);

  // Google OAuth
  router.get('/google', controller.getGoogleAuthUrl);
  router.get('/google/callback', controller.loginWithGoogle);

  // Two-factor (email OTP)
  router.post('/verify-otp', validate({ body: verifyOtpSchema }), controller.verifyOtp);
  router.get('/2fa/status',   authenticate, controller.getTwoFactorStatus);
  router.post('/2fa/setup',   authenticate, controller.setupTwoFactor);
  router.post('/2fa/confirm', authenticate, validate({ body: twoFactorCodeSchema }), controller.confirmTwoFactor);
  router.post('/2fa/disable', authenticate, controller.disableTwoFactor);

  return router;
}
