/**
 * MajorsService — manages major identity/metadata ONLY. All rich content
 * (sections, FAQs) is handled by the polymorphic ContentService, never here.
 *
 * Implements EntityExistenceChecker so it can be registered with the
 * ContentService to validate `entityType=MAJOR` references. It also exposes
 * `fileOwnerExists` so it can act as a FileOwnerExistenceChecker for files
 * owned by a major (registered with FilesService in the DI container).
 */

// ┌─────────────────────────────────────────────────────────────┐
// │ STUB — implement this file. (Reference impl in CodeDev.)     │
// └─────────────────────────────────────────────────────────────┘
// File: backend/src/modules/majors/majors.service.ts
// Expected exports: CollegeChecker, MajorsService
//
// TODO: implement.

export {};
