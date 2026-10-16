import type { DashboardRepository } from './dashboard.repository.js';
import type { DeletedItemsService } from '../deleted-items/deleted-items.service.js';
import type { DashboardStats, RecentActivity, RecentDeletedItem } from './dashboard.types.js';

export class DashboardService {
  constructor(
    private readonly repo: DashboardRepository,
    private readonly deletedItems: DeletedItemsService,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const [counts, queue] = await Promise.all([
      this.repo.getCounts(),
      this.deletedItems.listQueue(),
    ]);

    return { ...counts, deletedItems: queue.length };
  }

  async getRecentActivity(): Promise<RecentActivity> {
    const [uploads, auditLogs, contactMessages, queue] = await Promise.all([
      this.repo.recentUploads(10),
      this.repo.recentAuditLogs(10),
      this.repo.recentContactMessages(10),
      this.deletedItems.listQueue(),
    ]);

    const recentDeletedItems: RecentDeletedItem[] = queue
      .slice(0, 10)
      .map(item => ({
        id:           item.id,
        entityType:   item.entityType,
        label:        item.label,
        deletedAt:    item.deletedAt,
        deletedById:  item.deletedById,
        deleteReason: item.deleteReason,
      }));

    return {
      recentUploads:        uploads,
      recentAuditLogs:      auditLogs,
      recentDeletedItems,
      recentContactMessages: contactMessages,
    };
  }
}