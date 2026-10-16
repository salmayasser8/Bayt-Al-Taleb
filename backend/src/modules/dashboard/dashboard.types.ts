import type { AuditAction, AuditEntityType, FileOwnerType, FileStatus, FileType } from '@prisma/client';

export interface DashboardCounts {
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
}

export interface DashboardStats extends DashboardCounts {
  deletedItems: number;
}

export interface RecentUpload {
  id: string;
  title: string;
  type: FileType;
  status: FileStatus;
  ownerType: FileOwnerType | string;
  ownerId: string;
  uploadedById: string;
  createdAt: Date;
}

export interface RecentAuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  createdAt: Date;
}

export interface RecentDeletedItem {
  id: string;
  entityType: AuditEntityType;
  label: string;
  deletedAt: Date;
  deletedById: string | null;
  deleteReason: string | null;
  
}

export interface RecentContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  isHandled: boolean;
  createdAt: Date;
}

export interface RecentActivity {
  recentUploads: RecentUpload[];
  recentAuditLogs: RecentAuditLog[];
  recentDeletedItems: RecentDeletedItem[];
  recentContactMessages: RecentContactMessage[];
}