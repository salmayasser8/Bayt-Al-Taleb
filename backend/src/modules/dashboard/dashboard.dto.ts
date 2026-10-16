import type { AuditAction, AuditEntityType, FileOwnerType, FileStatus, FileType } from '@prisma/client';

export interface DashboardStatsDto {
  totalUsers: number;
  totalMajors: number;
  totalColleges: number;
  totalScholarships: number;
  totalFiles: number;
  pendingFiles: number;
  approvedFiles: number;
  rejectedFiles: number;
  totalContactMessages: number;
  unhandledContactMessages: number;
  deletedItems: number;
}

export interface RecentUploadDto {
  id: string;
  title: string;
  type: FileType;
  status: FileStatus;
  ownerType: FileOwnerType | string;
  ownerId: string;
  uploadedById: string;
  createdAt: Date;
}

export interface RecentAuditLogDto {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  createdAt: Date;
}

export interface RecentDeletedItemDto {
  id: string;
  entityType: AuditEntityType;
  label: string;
  deletedAt: Date;
  deletedById: string | null;
  deleteReason: string | null;
}

export interface RecentContactMessageDto {
  id: string;
  name: string;
  email: string;
  subject: string;
  isHandled: boolean;
  createdAt: Date;
}

export interface RecentActivityDto {
  recentUploads: RecentUploadDto[];
  recentAuditLogs: RecentAuditLogDto[];
  recentDeletedItems: RecentDeletedItemDto[];
  recentContactMessages: RecentContactMessageDto[];
}