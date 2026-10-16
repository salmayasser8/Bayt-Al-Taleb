import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaFileUpload,
  FaUserShield,
} from "react-icons/fa";
import { FiCheck, FiInbox } from "react-icons/fi";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  NotificationItem,
} from "@/api/notifications";
import { useAuth } from "@/store/AuthContext";

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return "الآن";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return date.toLocaleDateString("ar-EG");
};

const getNotificationVisual = (item: NotificationItem) => {
  const title = item.title.toLowerCase();
  const metaType = item.metadata && typeof item.metadata === "object"
    ? (item.metadata as Record<string, any>).type || (item.metadata as Record<string, any>).action
    : "";

  if (title.includes("موافقة") || title.includes("approved") || metaType === "APPROVE") {
    return {
      icon: <FaCheckCircle className="text-emerald-500" size={18} />,
      bg: "bg-emerald-50 border-emerald-100",
    };
  }

  if (title.includes("رفض") || title.includes("rejected") || metaType === "REJECT") {
    return {
      icon: <FaTimesCircle className="text-rose-500" size={18} />,
      bg: "bg-rose-50 border-rose-100",
    };
  }

  if (title.includes("مشرف") || metaType === "MODERATOR_ASSIGNED") {
    return {
      icon: <FaUserShield className="text-purple-500" size={18} />,
      bg: "bg-purple-50 border-purple-100",
    };
  }

  if (title.includes("ملف جديد") || metaType === "FILE_UPLOAD") {
    return {
      icon: <FaFileUpload className="text-blue-500" size={18} />,
      bg: "bg-blue-50 border-blue-100",
    };
  }

  return {
    icon: <FaBell className="text-accent" size={18} />,
    bg: "bg-amber-50 border-amber-100",
  };
};

export const NotificationDropdown: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    if (!isAuthenticated) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
    }
  };

  const fetchList = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await getNotifications(1, 20);
      const items = res?.items ?? [];
      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      fetchList();
      fetchUnread();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        
      }
    }

    setIsOpen(false);

    if (user?.role === "MODERATOR") {
      navigate("/supervisor");
    } else if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
     
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="الإشعارات"
        className="relative p-2  rounded-lg  text-paragraph hover:text-accent hover:bg-white/5 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center outline-none"
      >
        <FaBell size={20} />

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -left-1 min-w-[20px] h-[20px] px-1 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-primary"
          >
            {unreadCount > 99 ? "+99" : unreadCount}
          </motion.span>
        )}
      </button>

     
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-3 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden text-right"
          >
            <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary text-base">الإشعارات</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                    {unreadCount} جديد
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:text-blue-700 font-semibold flex items-center gap-1 bg-transparent border-none cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                >
                  <FiCheck size={14} />
                  <span>تحديد الكل كمقروء</span>
                </button>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">جاري تحميل الإشعارات...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <FiInbox size={36} className="text-primary/70" />
                  <p className="text-sm font-medium m-0 text-primary">لا توجد إشعارات حالياً</p>
                  <span className="text-xs text-gray-400">
                    ستظهر التنبيهات الجديدة هنا فور حدوثها
                  </span>
                </div>
              ) : (
                notifications.map((item) => {
                  const visual = getNotificationVisual(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-gray-50 ${
                        !item.isRead ? "bg-blue-50/40" : "bg-white"
                      }`}
                    >
                     
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${visual.bg}`}
                      >
                        {visual.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4
                            className={`text-xs sm:text-sm font-bold truncate m-0 ${
                              !item.isRead ? "text-gray-900" : "text-primary"
                            }`}
                          >
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-gray-400 shrink-0">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed m-0 line-clamp-2">
                          {item.message}
                        </p>
                      </div>

                      {!item.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

          
            {notifications.length > 0 && (
              <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                <span className="text-[11px] text-primary">
                  انقر على أي إشعار للانتقال إلى الصفحة المرتبطة
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
