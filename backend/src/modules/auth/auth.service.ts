/**
 * AuthService — owns ALL authentication business logic.
 *
 * Dependencies (repository, hasher, token service) are injected, so the
 * service is unit-testable with mocks and contains no framework or I/O
 * coupling beyond those interfaces. Controllers stay thin and just call these.
 *
 * Refresh-token strategy: we sign a JWT refresh token whose `jti` is a random
 * id; we persist only a SHA-256 hash of the signed token. On refresh we verify
 * the JWT, look up its hash, ensure it is not revoked/expired, rotate it
 * (revoke old, issue new). This enables server-side logout & theft detection.
 */

// ┌─────────────────────────────────────────────────────────────┐
// │ STUB — implement this file. (Reference impl in CodeDev.)     │
// └─────────────────────────────────────────────────────────────┘
// File: backend/src/modules/auth/auth.service.ts
// Expected exports: AuthService
//
// TODO: implement.

export {};
