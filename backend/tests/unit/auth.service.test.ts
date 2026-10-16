import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleName } from '@prisma/client';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import type { AuthRepository } from '../../src/modules/auth/auth.repository.js';
import { ConflictError, UnauthorizedError } from '../../src/shared/errors/app-error.js';
import { FakePasswordHasher, FakeTokenService } from '../mocks/fakes.js';
import { makeUser } from '../fixtures/index.js';

/**
 * AuthService unit tests — register, login, refresh token.
 * The service is exercised entirely through mocks (repo + fake hasher/token),
 * so these run with no DB and no real crypto.
 */
describe('AuthService', () => {
  let repo: AuthRepository;
  let service: AuthService;

  const withRole = (user = makeUser()) => ({ ...user, role: { name: RoleName.MEMBER } });

  beforeEach(() => {
    repo = {
      findUserByEmail: vi.fn(),
      findUserById: vi.fn(),
      findRoleByName: vi.fn().mockResolvedValue({
        id: 'role_member',
        name: RoleName.MEMBER,
      }),
      findRoleNameById: vi.fn().mockResolvedValue(RoleName.MEMBER),
      createUser: vi.fn(),
      createRefreshToken: vi.fn().mockResolvedValue({}),
      findRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
      revokeAllUserRefreshTokens: vi.fn().mockResolvedValue(undefined),
    } as unknown as AuthRepository;

    service = new AuthService(
      repo,
      new FakePasswordHasher(),
      new FakeTokenService(),
      7 * 24 * 60 * 60 * 1000,
      {} as any,
      { sendOtpCode: async () => {} } as any,
    );
  });

  describe('register', () => {
    it('creates a user and returns tokens', async () => {
      vi.mocked(repo.findUserByEmail).mockResolvedValue(null);
      vi.mocked(repo.createUser).mockResolvedValue(withRole());

      const result = await service.register({
        email: 'student@example.com',
        password: 'password123',
        fullName: 'Test Student',
      });

      expect(repo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'student@example.com',
          passwordHash: 'hashed:password123',
        }),
      );
      expect(result.user.email).toBe('student@example.com');
      expect(result.tokens.accessToken).toContain('access.');
      expect(repo.createRefreshToken).toHaveBeenCalledOnce();
    });

    it('rejects a duplicate email with ConflictError', async () => {
      vi.mocked(repo.findUserByEmail).mockResolvedValue(withRole());
      await expect(
        service.register({
          email: 'student@example.com',
          password: 'password123',
          fullName: 'X Y',
        }),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(repo.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      vi.mocked(repo.findUserByEmail).mockResolvedValue(withRole());
      const result = await service.login({ email: 'student@example.com', password: 'password123' });
      if (result.requiresTwoFactor) throw new Error('2FA not expected');
      expect(result.user.role).toBe(RoleName.MEMBER);
      expect(result.tokens.refreshToken).toContain('refresh.');
    });

    it('throws UnauthorizedError for a wrong password', async () => {
      vi.mocked(repo.findUserByEmail).mockResolvedValue(withRole());
      await expect(
        service.login({ email: 'student@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('throws UnauthorizedError for an inactive user', async () => {
      vi.mocked(repo.findUserByEmail).mockResolvedValue(withRole(makeUser({ isActive: false })));
      await expect(
        service.login({ email: 'student@example.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });

  describe('refresh token', () => {
    it('rotates a valid refresh token and issues a new pair', async () => {
      const tokens = new FakeTokenService();
      const refreshToken = tokens.signRefreshToken({ sub: 'usr_1', jti: 'jti_1' });

      vi.mocked(repo.findRefreshToken).mockResolvedValue({
        id: 'rt_1',
        userId: 'usr_1',
        tokenHash: 'irrelevant',
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        createdAt: new Date(),
      });
      vi.mocked(repo.findUserById).mockResolvedValue(withRole());

      const result = await service.refresh({ refreshToken });

      expect(repo.revokeRefreshToken).toHaveBeenCalledOnce();
      expect(repo.createRefreshToken).toHaveBeenCalledOnce();
      expect(result.tokens.accessToken).toContain('access.');
    });

    it('rejects a revoked/expired refresh token', async () => {
      const refreshToken = new FakeTokenService().signRefreshToken({ sub: 'usr_1', jti: 'j' });
      vi.mocked(repo.findRefreshToken).mockResolvedValue({
        id: 'rt_1',
        userId: 'usr_1',
        tokenHash: 'x',
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: new Date(),
        createdAt: new Date(),
      });
      await expect(service.refresh({ refreshToken })).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('rejects a malformed refresh token', async () => {
      await expect(service.refresh({ refreshToken: 'not-a-token' })).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });
});
