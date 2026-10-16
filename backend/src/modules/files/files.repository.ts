import type { PrismaClient, FileOwnerType, FileStatus } from '@prisma/client';
import type { FileView, UploadFileData, FileListFilter } from './files.types.js';

export class FilesRepository {
  constructor(private readonly db: PrismaClient) {}

  private toView(row: any): FileView {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      status: row.status,
      storageKey: row.storageKey,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      tags: row.tags,
      rating: row.rating,
      downloads: row.downloads,
      ownerType: row.ownerType,
      ownerId: row.ownerId,
      uploadedById: row.uploadedById,
      uploadedBy: row.uploadedBy ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }

  private readonly includeUploadedBy = {
    uploadedBy: {
      select: { id: true, fullName: true, email: true },
    },
  };

  async create(data: UploadFileData): Promise<FileView> {
    const row = await this.db.file.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        status: data.status ?? 'PENDING',
        ownerType: data.ownerType,
        ownerId: data.ownerId,
        uploadedById: data.uploadedById ?? '',
        storageKey: data.storageKey,
        mimeType: data.mimeType ?? null,
        sizeBytes: data.sizeBytes ?? null,
      },
      include: this.includeUploadedBy,
    });
    return this.toView(row);
  }

  async findById(id: string): Promise<FileView | null> {
    const row = await this.db.file.findFirst({
      where: { id, deletedAt: null },
      include: this.includeUploadedBy,
    });
    return row ? this.toView(row) : null;
  }

  async findAll(filter: FileListFilter): Promise<{ items: FileView[]; total: number }> {
    const where: any = { deletedAt: null };
    if (filter.ownerType) where.ownerType = filter.ownerType;
    if (filter.ownerId) where.ownerId = filter.ownerId;
    if (filter.status) where.status = filter.status;
    if (filter.type) where.type = filter.type;
    if (filter.uploadedById) where.uploadedById = filter.uploadedById;

    const skip = (filter.page - 1) * filter.pageSize;

    const [rows, total] = await Promise.all([
      this.db.file.findMany({
        where,
        skip,
        take: filter.pageSize,
        orderBy: { createdAt: 'desc' },
        include: this.includeUploadedBy,
      }),
      this.db.file.count({ where }),
    ]);

    return { items: rows.map((r) => this.toView(r)), total };
  }

  async findByOwner(
    ownerType: FileOwnerType,
    ownerId: string,
    filter: Omit<FileListFilter, 'ownerType' | 'ownerId'>,
  ): Promise<{ items: FileView[]; total: number }> {
    const where = { ownerType, ownerId, deletedAt: null };
    const skip = (filter.page - 1) * filter.pageSize;

    const [rows, total] = await Promise.all([
      this.db.file.findMany({
        where,
        skip,
        take: filter.pageSize,
        orderBy: { createdAt: 'desc' },
        include: this.includeUploadedBy,
      }),
      this.db.file.count({ where }),
    ]);

    return { items: rows.map((r) => this.toView(r)), total };
  }

  async findApprovedByOwner(ownerType: FileOwnerType, ownerId: string): Promise<FileView[]> {
    const rows = await this.db.file.findMany({
      where: { ownerType, ownerId, status: 'APPROVED', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: this.includeUploadedBy,
    });
    return rows.map((r) => this.toView(r));
  }

  async updateStatus(id: string, status: FileStatus): Promise<FileView> {
    const row = await this.db.file.update({
      where: { id },
      data: { status },
      include: this.includeUploadedBy,
    });
    return this.toView(row);
  }

  async softDelete(id: string, deletedById: string, reason?: string): Promise<void> {
    await this.db.file.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById,
        deleteReason: reason ?? null,
      },
    });
  }

  async incrementDownloads(id: string): Promise<void> {
    await this.db.file.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });
  }

  /**
   * Find all moderator IDs assigned to an owner entity (Course, Major, or Scholarship).
   * For Courses, also includes moderators assigned to the parent Major.
   */
  async findModeratorIdsForOwner(ownerType: FileOwnerType, ownerId: string): Promise<string[]> {
    if (ownerType === 'COURSE') {
      const course = await this.db.course.findUnique({
        where: { id: ownerId },
        select: {
          moderators: { select: { id: true } },
          major: {
            select: {
              moderators: { select: { id: true } },
            },
          },
        },
      });
      if (!course) return [];
      const ids = new Set<string>();
      course.moderators.forEach((m) => ids.add(m.id));
      course.major?.moderators.forEach((m) => ids.add(m.id));
      return Array.from(ids);
    }

    if (ownerType === 'MAJOR') {
      const major = await this.db.major.findUnique({
        where: { id: ownerId },
        select: { moderators: { select: { id: true } } },
      });
      return major?.moderators.map((m) => m.id) ?? [];
    }

    if (ownerType === 'SCHOLARSHIP') {
      const scholarship = await this.db.scholarship.findUnique({
        where: { id: ownerId },
        select: { moderators: { select: { id: true } } },
      });
      return scholarship?.moderators.map((m) => m.id) ?? [];
    }

    return [];
  }
}
