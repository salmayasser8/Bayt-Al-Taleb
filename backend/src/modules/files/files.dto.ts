// modules/files/files.dto.ts
import type { FileView } from './files.types.js';

export function toFileDto(view: FileView, publicUrl: string | null) {
  return {
    id: view.id,
    title: view.title,
    description: view.description,
    type: view.type,
    status: view.status,
    publicUrl,
    mimeType: view.mimeType,
    sizeBytes: view.sizeBytes,

    // ⬇️ ADD THESE NEW FIELDS ⬇️
    tags: view.tags || [],
    rating: view.rating || 0,
    downloads: view.downloads || 0,
    // ⬆️ ADD THESE NEW FIELDS ⬆️

    ownerType: view.ownerType,
    ownerId: view.ownerId,
    uploadedById: view.uploadedById,

    // ⬇️ ADD THIS TO SHOW THE UPLOADER'S NAME ⬇️
    uploadedBy: view.uploadedBy
      ? {
          id: view.uploadedBy.id,
          fullName: view.uploadedBy.fullName,
          email: view.uploadedBy.email,
        }
      : null,

    createdAt: view.createdAt,
    updatedAt: view.updatedAt,
  };
}
