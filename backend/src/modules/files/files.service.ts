import { FileStatus } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../../shared/errors/app-error.js';
import type { Actor } from '../authorization/authorization.types.js';
import type { Database } from '../../infrastructure/database/prisma.js';

/**
 * FilesService — minimal implementation exposing the FileStatusUpdater contract
 * required by ReviewsService.
 *
 * Full file upload / download / listing surfaces are TODO once the storage
 * layer is wired.
 */
export class FilesService {
  constructor(private readonly db: Database) {}

  /**
   * Assert the actor may manage (review) the given file.
   * Returns the file's current status and uploader id on success.
   * Throws NotFoundError when the file does not exist.
   * Throws ForbiddenError when the actor is the uploader
   * (uploaders may not review their own files).
   */
  async assertCanManageFile(
    actor: Actor,
    fileId: string,
  ): Promise<{ status: FileStatus; uploadedById: string }> {
    const file = await this.db.file.findFirst({ where: { id: fileId } });
    if (!file) throw new NotFoundError('File not found');
    if (file.uploadedById === actor.id) {
      throw new ForbiddenError('You cannot review your own file');
    }
    return { status: file.status as FileStatus, uploadedById: file.uploadedById };
  }

  /** Transition the file to the given status (APPROVED | REJECTED). */
  async applyReviewStatus(fileId: string, status: FileStatus): Promise<void> {
    await this.db.file.update({ where: { id: fileId }, data: { status } });
  }
}
