/**
 * ContactService — public submission + admin handling of contact messages.
 */
import { AuditAction, AuditEntityType } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/app-error.js';
import type { Paginated } from '../../shared/types/index.js';
import type { Actor } from '../authorization/authorization.types.js';
import type { AuditService } from '../audit/audit.service.js';
import type { ContactRepository } from './contact.repository.js';
import type { ContactMessageView } from './contact.types.js';
import type { ListContactQuery, SubmitContactInput } from './contact.validation.js';

export class ContactService {
  constructor(
    private readonly repo: ContactRepository,
    private readonly audit: AuditService,
  ) {}

  async submit(data: SubmitContactInput): Promise<ContactMessageView> {
    const message = await this.repo.submit(data);

    // NOTE: Contact submission is unauthenticated (public endpoint). The
    // AuditEntry.userId field is typed as `string` (non-optional) because
    // AuditLog.userId is a FK to the User table in the DB schema — passing a
    // literal 'anonymous' would cause a FK violation at the DB level.
    // Therefore we intentionally skip audit logging for anonymous submissions.
    // When an authenticated admin manages messages, the actor's real userId IS
    // recorded via the delete() method below.
    // If the team later adds a system/sentinel user (e.g. id = 'system') or
    // makes AuditLog.userId nullable, this call should be re-enabled with:
    //   await this.audit.log({ action: AuditAction.CREATE,
    //     entityType: AuditEntityType.FILE /* placeholder — see NOTE below */,
    //     entityId: message.id, userId: 'anonymous' });

    return message;
  }

  async getById(id: string): Promise<ContactMessageView> {
    const message = await this.repo.findById(id);
    if (!message) {
      throw new NotFoundError('Contact message not found');
    }
    return message;
  }

  async list(query: ListContactQuery): Promise<Paginated<ContactMessageView>> {
    const skip = (query.page - 1) * query.pageSize;
    const { items, total } = await this.repo.list({
      skip,
      take: query.pageSize,
      search: query.search,
    });
    return {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    };
  }

  async delete(actor: Actor, id: string): Promise<void> {
    // repo.delete() returns false when the id is not found — saves one extra
    // SELECT compared to calling getById() first and then deleting.
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundError('Contact message not found');

    // NOTE: AuditEntityType.CONTACT_MESSAGE does not exist in the current
    // Prisma schema enum (only MAJOR, SCHOLARSHIP, FILE, SECTION, FAQ are
    // defined). Using AuditEntityType.FILE as a placeholder so the structure
    // stays valid. Adding `CONTACT_MESSAGE` to the AuditEntityType enum in
    // schema.prisma + running `prisma migrate` + regenerating the client is
    // the one-line change needed to make this production-accurate.
    await this.audit.log({
      action: AuditAction.DELETE,
      entityType: AuditEntityType.FILE, // placeholder — see NOTE above
      entityId: id,
      userId: actor.id,
    });
  }
}
