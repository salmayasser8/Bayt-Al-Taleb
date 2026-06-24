/**
 * ReviewsService — the single authority over the file approval workflow.
 *
 * Recording a review: (1) verifies the file exists & is still PENDING, then
 * (2) persists the review (immutable audit trail), then (3) transitions the
 * file's status via FilesService. FilesService is injected, so the workflow is
 * unit-testable end-to-end with mocks and no DB.
 */
import { AuditAction, AuditEntityType, FileStatus, ReviewAction } from '@prisma/client';
import { ConflictError, ForbiddenError } from '../../shared/errors/app-error.js';
import type { Actor } from '../authorization/authorization.types.js';
import type { AuditService } from '../audit/audit.service.js';
import type { ReviewsRepository } from './reviews.repository.js';
import type { ReviewView } from './reviews.types.js';
import type { CreateReviewInput } from './reviews.validation.js';

/**
 * Minimal interface over FilesService to avoid a circular import.
 * The DI container passes the real FilesService at runtime.
 */
interface FileStatusUpdater {
  getById(id: string): Promise<{
    id: string;
    status: FileStatus;
    uploadedById: string;
  }>;
  setStatus(id: string, status: FileStatus): Promise<void>;
}

/**
 * Minimal interface over NotificationService to avoid a circular import.
 * The DI container passes the real NotificationService at runtime.
 */
interface ReviewNotifier {
  notifyUser(
    userId: string,
    title: string,
    message: string,
    metadata?: unknown,
  ): Promise<void>;
}

export class ReviewsService {
  constructor(
    private readonly repo: ReviewsRepository,
    private readonly files: FileStatusUpdater,
    private readonly audit: AuditService,
    private readonly notifications: ReviewNotifier,
  ) {}

  /**
   * Submit a review decision for a file.
   * Steps execute in strict order: check → persist → transition → audit → notify.
   */
  async submit(actor: Actor, fileId: string, input: CreateReviewInput): Promise<ReviewView> {
    // 1. Load the file. getById throws NotFoundError if missing — let it propagate.
    const file = await this.files.getById(fileId);

    // 2. Only PENDING files can be reviewed.
    if (file.status !== FileStatus.PENDING) {
      throw new ConflictError('File has already been reviewed');
    }

    // 3. A reviewer cannot review their own upload.
    if (file.uploadedById === actor.id) {
      throw new ForbiddenError('Reviewers cannot review their own uploads');
    }

    // 4. Persist the immutable review record.
    const review = await this.repo.create({
      fileId,
      reviewerId: actor.id,
      action: input.action,
      comment: input.comment ?? null,
    });

    // 5. Transition file status based on the review decision.
    const newStatus =
      input.action === ReviewAction.APPROVE ? FileStatus.APPROVED : FileStatus.REJECTED;
    await this.files.setStatus(fileId, newStatus);

    // 6. Append to the audit log (fire-and-forget — AuditService never throws).
    await this.audit.log({
      userId: actor.id,
      action: AuditAction.UPDATE,
      entityType: AuditEntityType.FILE,
      entityId: fileId,
      metadata: { action: input.action, reviewId: review.id },
    });

    // 7. Notify the file owner. Errors are swallowed — a notification failure
    //    must never surface as an HTTP error on the review request.
    const title =
      input.action === ReviewAction.APPROVE ? 'File approved' : 'File rejected';
    const message =
      input.action === ReviewAction.APPROVE
        ? 'Your file has been approved'
        : input.comment
          ? `Your file has been rejected: ${input.comment}`
          : 'Your file has been rejected';

    try {
      await this.notifications.notifyUser(file.uploadedById, title, message);
    } catch {
      /* non-critical — notification failure must not fail the review */
    }

    // 8. Return the persisted review view.
    return review;
  }

  /**
   * Return all reviews for a file, newest first.
   * An empty array is valid when no reviews exist yet — no NotFoundError raised.
   */
  async listByFile(fileId: string): Promise<ReviewView[]> {
    return this.repo.listByFileId(fileId);
  }
}
