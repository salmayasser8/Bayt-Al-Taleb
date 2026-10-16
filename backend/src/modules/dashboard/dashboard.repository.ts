import type { PrismaClient } from '@prisma/client';
import { FileStatus } from '@prisma/client';
import type { DashboardCounts, RecentUpload, RecentAuditLog, RecentContactMessage } from './dashboard.types.js';

export class DashboardRepository {
  constructor(private readonly db: PrismaClient) {}

  async getCounts(): Promise<DashboardCounts> {
    const [
      totalUsers,
      totalMajors,
      totalColleges,
      totalScholarships,
      totalFiles,
      pendingFiles,
      approvedFiles,
      rejectedFiles,
      totalContactMessages,
      unhandledContactMessages,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.major.count({ where: { deletedAt: null } }),
      this.db.college.count(),
      this.db.scholarship.count({ where: { deletedAt: null } }),
      this.db.file.count({ where: { deletedAt: null } }),
      this.db.file.count({ where: { deletedAt: null, status: FileStatus.PENDING } }),
      this.db.file.count({ where: { deletedAt: null, status: FileStatus.APPROVED } }),
      this.db.file.count({ where: { deletedAt: null, status: FileStatus.REJECTED } }),
      this.db.contactMessage.count(),
      this.db.contactMessage.count({ where: { isHandled: false } }),
    ]);

    return {
      totalUsers, totalMajors, totalColleges, totalScholarships,
      totalFiles, pendingFiles, approvedFiles, rejectedFiles,
      totalContactMessages, unhandledContactMessages,
    };
  }

  async recentUploads(limit = 10): Promise<RecentUpload[]> {
    const files = await this.db.file.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, title: true, type: true, status: true, ownerType: true, ownerId: true, uploadedById: true, createdAt: true },
    });
    return files;
  }

  async recentAuditLogs(limit = 10): Promise<RecentAuditLog[]> {
    return this.db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, userId: true, action: true, entityType: true, entityId: true, createdAt: true },
    });
  }

  async recentContactMessages(limit = 10): Promise<RecentContactMessage[]> {
    return this.db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, name: true, email: true, subject: true, isHandled: true, createdAt: true },
    });
  }
}