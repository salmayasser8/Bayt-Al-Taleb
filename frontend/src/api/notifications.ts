import api from "./axios";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationsResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** جلب قائمة الإشعارات الخاصة بالمستخدم الحالي */
export const getNotifications = async (page = 1, pageSize = 20): Promise<NotificationsResponse> => {
  const res = await api.get("/notifications", {
    params: { page, pageSize },
  });
  return res.data?.data ?? res.data;
};

/** جلب عدد الإشعارات غير المقروءة */
export const getUnreadCount = async (): Promise<number> => {
  const res = await api.get("/notifications/unread-count");
  return res.data?.data?.unreadCount ?? 0;
};

/** تحديد إشعار معين كمقروء */
export const markAsRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

/** تحديد جميع الإشعارات كمقروءة */
export const markAllAsRead = async (): Promise<number> => {
  const res = await api.patch("/notifications/read-all");
  return res.data?.data?.updated ?? 0;
};
