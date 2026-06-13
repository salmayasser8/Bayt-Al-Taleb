/**
 * NotificationService — in-app notifications.
 *
 * `notifyUser` / `notifyRole` are the reusable entry points other modules call
 * (Reviews → approve/reject, DeletedItems → restore, Users → role change).
 * Those auto-notifications MUST NOT break the triggering business action, so
 * `notifyUser`/`notifyRole` swallow & log persistence errors (the action
 * already succeeded). The user-facing read/list operations surface errors
 * normally (e.g. 404 on an unknown notification).
 */

// ┌─────────────────────────────────────────────────────────────┐
// │ STUB — implement this file. (Reference impl in CodeDev.)     │
// └─────────────────────────────────────────────────────────────┘
// File: backend/src/modules/notifications/notifications.service.ts
// Expected exports: NotificationService
//
// TODO: implement.

export {};
