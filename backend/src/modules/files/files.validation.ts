/**
 * Note: actual binary upload (multipart) handling is intentionally out of
 * scope for the foundation. Here we validate the file METADATA; `storageKey`
 * is produced by whatever storage adapter a future dev plugs in (S3, disk…).
 *
 * Every file must declare its polymorphic owner (ownerType + ownerId); the
 * service rejects uploads whose owner entity does not exist.
 */

// ┌─────────────────────────────────────────────────────────────┐
// │ STUB — implement this file. (Reference impl in CodeDev.)     │
// └─────────────────────────────────────────────────────────────┘
// File: backend/src/modules/files/files.validation.ts
// Expected exports: uploadFileSchema, uploadFileMetaSchema, fileIdParamsSchema, fileOwnerParamsSchema, listFilesQuerySchema, UploadFileInput, UploadFileMetaInput, ListFilesQuery, FileOwnerParams
//
// TODO: implement.

export {};
