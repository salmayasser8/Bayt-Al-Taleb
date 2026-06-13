/**
 * AuthorizationService — reusable ownership authorization for moderator-scoped
 * entities. This is the SINGLE source of truth for "can this user manage that
 * major/scholarship?", enforced in the service layer (not just middleware) so
 * the rule holds no matter which entry point reaches a mutation.
 *
 * Rules:
 *   - SUPER_ADMIN and ADMIN bypass ownership checks entirely.
 *   - MODERATOR may manage ONLY entities explicitly assigned to them.
 *   - Any other role is denied.
 *
 * `canManage*` return a boolean; `assertCanManage*` throw ForbiddenError on
 * denial (the form services use to fail fast). Does NOT redesign RBAC — it
 * complements the existing permission guards with row-level ownership.
 */

// ┌─────────────────────────────────────────────────────────────┐
// │ STUB — implement this file. (Reference impl in CodeDev.)     │
// └─────────────────────────────────────────────────────────────┘
// File: backend/src/modules/authorization/authorization.service.ts
// Expected exports: AuthorizationService
//
// TODO: implement.

export {};
