import crypto from 'crypto';
import type { AuthRepository } from './auth.repository.js';
import type { TokenService, PasswordHasher, AuthResult, RefreshTokenPayload } from './auth.types.js';
import type { RegisterInput, LoginInput, RefreshInput, LogoutInput } from './auth.validation.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors/app-error.js';
import { RoleName } from '@prisma/client';
import type { GoogleAuthService } from './google-auth.service.js';
import type { OtpMailer } from './email.service.js';

/** Result of login: either full tokens, or a 2FA challenge. */
export type LoginResult =
  | (AuthResult & { requiresTwoFactor?: false })
  | { requiresTwoFactor: true; tempToken: string };

/** OTP codes live 10 minutes. */
const OTP_TTL_MS = 10 * 60 * 1000;

/**
 * AuthService — owns ALL authentication business logic.
 *
 * Refresh-token strategy:
 *   - Sign a JWT whose `jti` is a random UUID.
 *   - Persist only SHA-256(signedToken) in the DB.
 *   - On refresh: verify JWT → look up hash → check not revoked/expired →
 *     revoke old → issue new pair. Enables server-side logout & theft detection.
 */
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly refreshTtlMs: number,   // e.g. 7 * 24 * 60 * 60 * 1000
    private readonly googleAuth: GoogleAuthService,
    private readonly mailer: OtpMailer,
  ) {}

  // ─── Register ────────────────────────────────────────────────

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email is already in use');
    }

    const memberRole = await this.repo.findRoleByName(RoleName.MEMBER);
    if (!memberRole) throw new Error('MEMBER role not seeded');

    const passwordHash = await this.hasher.hash(input.password);

    const user = await this.repo.createUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      roleId: memberRole.id,
    });

    const tokens = await this.#issueTokenPair(user.id, user.email, user.role.name);

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
      tokens,
    };
  }

  // ─── Login ───────────────────────────────────────────────────

  async login(input: LoginInput): Promise<LoginResult> {
    const user = await this.repo.findUserByEmail(input.email);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    if (!user.passwordHash) throw new UnauthorizedError('Invalid email or password');

    const valid = await this.hasher.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    if (!user.isActive) throw new UnauthorizedError('Account is deactivated');

    // 2FA is ON → do not issue tokens yet. Send an OTP code instead.
    if (user.twoFactorEnabled) {
      const code = this.#generateOtp();
      const hash = this.#hashToken(code);
      await this.repo.updateUser(user.id, {
        twoFactorSecret: hash,
        otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      });
      await this.mailer.sendOtpCode(user.email, code, 'login');

      // tempToken identifies the user for the upcoming OTP verification.
      const tempToken = this.tokenService.signAccess({
        sub: user.id,
        email: user.email,
        role: 'TWO_FACTOR',
      });

      return { requiresTwoFactor: true, tempToken };
    }

    const tokens = await this.#issueTokenPair(user.id, user.email, user.role.name);

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
      tokens,
    };
  }

  // ─── 2FA (email OTP) ─────────────────────────────────────────

  /** Verify the OTP code during login, then issue the real tokens. */
  async verifyOtp(input: { tempToken: string; code: string }): Promise<AuthResult> {
    let payload;
    try {
      payload = this.tokenService.verifyAccessToken(input.tempToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired session');
    }

    if (payload.role !== 'TWO_FACTOR') throw new UnauthorizedError('Invalid session');

    const user = await this.repo.findUserById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedError('User not found or deactivated');

    if (!user.twoFactorSecret || !user.otpExpiresAt) {
      throw new UnauthorizedError('Two-factor verification is not required');
    }
    if (user.otpExpiresAt < new Date()) {
      throw new UnauthorizedError('The code has expired. Please log in again.');
    }

    const hash = this.#hashToken(input.code.trim());
    if (hash !== user.twoFactorSecret) {
      throw new UnauthorizedError('Invalid code');
    }

    // Success → clear the code so it cannot be reused.
    await this.repo.updateUser(user.id, {
      twoFactorSecret: null,
      otpExpiresAt: null,
    });

    const tokens = await this.#issueTokenPair(user.id, user.email, user.role.name);

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
      tokens,
    };
  }

  /** Start enabling 2FA: email a confirmation code. */
  async setupTwoFactor(userId: string): Promise<void> {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    const code = this.#generateOtp();
    const hash = this.#hashToken(code);
    await this.repo.updateUser(user.id, {
      twoFactorSecret: hash,
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    await this.mailer.sendOtpCode(user.email, code, 'enable');
  }

  /** Confirm enabling 2FA with the emailed code. */
  async confirmTwoFactor(userId: string, code: string): Promise<void> {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    if (!user.twoFactorSecret || !user.otpExpiresAt) {
      throw new UnauthorizedError('Verification was not started');
    }
    if (user.otpExpiresAt < new Date()) {
      throw new UnauthorizedError('The code has expired. Please try again.');
    }

    const hash = this.#hashToken(code.trim());
    if (hash !== user.twoFactorSecret) throw new UnauthorizedError('Invalid code');

    await this.repo.updateUser(user.id, {
      twoFactorEnabled: true,
      twoFactorSecret: null,
      otpExpiresAt: null,
    });
  }

  /** Turn 2FA off. */
  async disableTwoFactor(userId: string): Promise<void> {
    await this.repo.updateUser(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      otpExpiresAt: null,
    });
  }

  /** Is 2FA enabled for this user? */
  async getTwoFactorStatus(userId: string): Promise<{ enabled: boolean }> {
    const user = await this.repo.findUserById(userId);
    return { enabled: Boolean(user?.twoFactorEnabled) };
  }

  // ─── Google OAuth ─────────────────────────────────────────────

  getGoogleAuthUrl(): string {
    return this.googleAuth.getAuthorizationUrl();
  }

  async loginWithGoogle(code: string): Promise<AuthResult> {
    const profile = await this.googleAuth.handleCallback(code);

    if (!profile.email) throw new UnauthorizedError('Google account has no email');

    const tokens = await this.#issueTokenPair(profile.id, profile.email, profile.role);

    return {
      user: { id: profile.id, email: profile.email, fullName: profile.fullName, role: profile.role },
      tokens,
    };
  }

  // ─── Refresh ─────────────────────────────────────────────────

  async refresh(input: RefreshInput): Promise<AuthResult> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.tokenService.verifyRefresh(input.refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenHash = this.#hashToken(input.refreshToken);
    const stored = await this.repo.findRefreshToken(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token is invalid or expired');
    }

    // Rotate: revoke old, issue new
    await this.repo.revokeRefreshToken(tokenHash);

    const user = await this.repo.findUserById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedError('User not found or deactivated');

    const tokens = await this.#issueTokenPair(user.id, user.email, user.role.name);

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
      tokens,
    };
  }

  // ─── Logout ──────────────────────────────────────────────────

  async logout(input: LogoutInput): Promise<void> {
    const tokenHash = this.#hashToken(input.refreshToken);
    await this.repo.revokeRefreshToken(tokenHash);
  }

  // ─── Private Helpers ─────────────────────────────────────────

  async #issueTokenPair(userId: string, email: string, role: string) {
    const jti = crypto.randomUUID();

    const accessToken  = this.tokenService.signAccess({ sub: userId, email, role });
    const refreshToken = this.tokenService.signRefresh({ sub: userId, jti });

    const tokenHash = this.#hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.refreshTtlMs);

    await this.repo.createRefreshToken({ userId, tokenHash, expiresAt });

    return { accessToken, refreshToken };
  }

  #hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /** Generate a random 6-digit OTP code, e.g. "482913". */
  #generateOtp(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  }
}