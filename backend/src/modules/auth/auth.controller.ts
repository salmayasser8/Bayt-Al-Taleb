/**
 * AuthController — thin. It validates nothing (the `validate` middleware did),
 * holds no business logic, and only: reads validated input → calls the
 * service → shapes the response DTO. Fully constructor-injected.
 */

// ┌─────────────────────────────────────────────────────────────┐
// │ STUB — implement this file. (Reference impl in CodeDev.)     │
// └─────────────────────────────────────────────────────────────┘
// File: backend/src/modules/auth/auth.controller.ts
// Expected exports: AuthController
//
// TODO: implement.

import type { Request, Response } from 'express';
import type { AuthService } from './auth.service.js';
import type { RegisterInput, LoginInput, RefreshInput, LogoutInput } from './auth.validation.js';
import { created, ok, noContent } from '../../shared/utils/http-response.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import type { AuthResponseDto } from './auth.dto.js';

/**
 * AuthController — thin HTTP layer.
 * Reads validated input → calls service → shapes DTO → sends response.
 */
export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as RegisterInput;
    const result = await this.service.register(input);
    const dto: AuthResponseDto = { user: result.user, tokens: result.tokens };
    created(res, dto);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as LoginInput;
    const result = await this.service.login(input);

    // 2FA required → do not return tokens yet.
    if (result.requiresTwoFactor) {
      ok(res, { requiresTwoFactor: true, tempToken: result.tempToken });
      return;
    }

    const dto: AuthResponseDto = { user: result.user, tokens: result.tokens };
    ok(res, dto);
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { tempToken, code } = req.body as { tempToken: string; code: string };
    const result = await this.service.verifyOtp({ tempToken, code });
    const dto: AuthResponseDto = { user: result.user, tokens: result.tokens };
    ok(res, dto);
  });

  setupTwoFactor = asyncHandler(async (req: Request, res: Response) => {
    await this.service.setupTwoFactor(req.user!.id);
    ok(res, { message: 'Verification code sent to your email' });
  });

  confirmTwoFactor = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body as { code: string };
    await this.service.confirmTwoFactor(req.user!.id, code);
    ok(res, { message: 'Two-factor authentication enabled' });
  });

  disableTwoFactor = asyncHandler(async (req: Request, res: Response) => {
    await this.service.disableTwoFactor(req.user!.id);
    ok(res, { message: 'Two-factor authentication disabled' });
  });

  getTwoFactorStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = await this.service.getTwoFactorStatus(req.user!.id);
    ok(res, status);
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as RefreshInput;
    const result = await this.service.refresh(input);
    const dto: AuthResponseDto = { user: result.user, tokens: result.tokens };
    ok(res, dto);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as LogoutInput;
    await this.service.logout(input);
    noContent(res);
  });

  getGoogleAuthUrl = asyncHandler(async (_req: Request, res: Response) => {
    const url = this.service.getGoogleAuthUrl();
    res.redirect(url);
  });

  loginWithGoogle = asyncHandler(async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) throw new Error('Missing code from Google');

    const result = await this.service.loginWithGoogle(code);

    const params = new URLSearchParams({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    });

    res.redirect(`http://localhost:5173/auth/callback?${params.toString()}`);
  });
}
