import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiUpload,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiEye,
  FiDownload,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "@/store/AuthContext";
import { getMyFiles } from "@/api/files";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FaFolderOpen } from "react-icons/fa";
import { PiHandWavingFill } from "react-icons/pi";
import api from "@/api/axios";
// ── Types ─────────────────────────────────────────────────────────────────────

type FileStatus = "PENDING" | "APPROVED" | "REJECTED";

interface UploadedFile {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  status: FileStatus;
  sizeBytes: number;
  ownerType: string;
  ownerId: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fileTypeLabel: Record<string, string> = {
  SUMMARY: "ملخص شامل",
  PREVIOUS_EXAM: "أسئلة تدريبية",
  SYLLABUS: "خطة مساق",
  OTHER: "ملف آخر",
};

const formatSize = (bytes: number) => {
  if (!bytes) return "0 كيلوبايت";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
};

// ── Animation Variants ────────────────────────────────────────────────────────
const cardPopUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Status helpers ────────────────────────────────────────────────────────────

const statusConfig: Record<
  FileStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  APPROVED: {
    label: "معتمد",
    icon: <FiCheckCircle size={14} />,
    className: "bg-green-100 text-green-700 border border-green-200",
  },
  PENDING: {
    label: "قيد المراجعة",
    icon: <FiClock size={14} />,
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  REJECTED: {
    label: "مرفوض",
    icon: <FiXCircle size={14} />,
    className: "bg-red-100 text-red-700 border border-red-200",
  },
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  colorClass,
}) => (
  <motion.div
    variants={cardPopUp}
    whileHover={{ y: -8 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4 shadow-sm hover:border-primary"
  >
    <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
    <div>
      <p className="text-gray-500 font-semibold text-sm">{label}</p>
      <p className="text-primary font-bold text-3xl">{value}</p>
    </div>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FileStatus | "all">("all");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!user) return;
      try {
        const data = await getMyFiles(user.id);
        const resolvedFiles = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data?.items)
            ? data.data.items
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [];
        setFiles(resolvedFiles);
      } catch (error) {
        console.error("Failed to fetch files", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiles();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bgSection flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const stats = {
    total: files.length,
    approved: files.filter((f) => f.status === "APPROVED").length,
    pending: files.filter((f) => f.status === "PENDING").length,
    rejected: files.filter((f) => f.status === "REJECTED").length,
  };
  const handleDownload = async (fileId: string) => {
    const res = await api.get(`/files/${fileId}/download`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "file.pdf";
    a.click();
  };
  const filtered =
    activeFilter === "all"
      ? files
      : files.filter((f) => f.status === activeFilter);

  const filterTabs: { key: FileStatus | "all"; label: string }[] = [
    { key: "all", label: "الكل" },
    { key: "APPROVED", label: "معتمد" },
    { key: "PENDING", label: "قيد المراجعة" },
    { key: "REJECTED", label: "مرفوض" },
  ];

  return (
    <div className="min-h-screen bg-bgSection">
      <div className="container py-10">
        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="font-bold text-2xl md:text-4xl text-primary mb-1">
              مرحباً، {user?.fullName}
              <PiHandWavingFill className="inline-block mr-2 text-accent" />
            </h1>
            <p className="text-gray-500 font-semibold">
              عضو في المنصة الأكاديمية
            </p>
          </div>
          <Link to="/upload">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-hero text-paragraph font-bold px-6 py-3 rounded-2xl border border-paragraph/30 transition-all"
            >
              <FiUpload size={18} />
              رفع ملف جديد
            </motion.button>
          </Link>
        </motion.div>

        {/* ── Profile Card + Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          {/* Profile */}
          <motion.div
            variants={cardPopUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl mb-4">
              {getInitials(user?.fullName || "?")}
            </div>
            <h2 className="font-bold text-xl text-primary mb-1">
              {user?.fullName}
            </h2>
            <p className="text-gray-500 text-sm font-semibold mb-1">
              {user?.email}
            </p>
            <div className="flex items-center gap-1 text-gray-400 text-sm mt-3 font-semibold">
              <FiUser size={18} />
              <span>عضو نشط</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={container}
            viewport={{ once: false, amount: 0.5 }}
            whileInView="visible"
            initial="hidden"
            className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <StatCard
              label="إجمالي الملفات"
              value={stats.total}
              icon={<FiFileText size={22} className="text-primary" />}
              colorClass="bg-primary/10"
            />
            <StatCard
              label="ملفات معتمدة"
              value={stats.approved}
              icon={<FiCheckCircle size={22} className="text-green-600" />}
              colorClass="bg-green-100"
            />
            <StatCard
              label="قيد المراجعة"
              value={stats.pending}
              icon={<FiClock size={22} className="text-yellow-600" />}
              colorClass="bg-yellow-100"
            />
            <StatCard
              label="مرفوض"
              value={stats.rejected}
              icon={<FiXCircle size={22} className="text-red-500" />}
              colorClass="bg-red-100"
            />
          </motion.div>
        </div>

        {/* ── Files Table ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Table header */}
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-bold text-xl text-primary flex items-center gap-2">
              <FiFileText size={20} />
              ملفاتي المرفوعة
            </h2>
            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                    activeFilter === tab.key
                      ? "bg-primary text-paragraph border-primary"
                      : "bg-white text-gray-500 border-gray-200 hover:border-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-primary/5 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-bold text-primary text-sm">
                    اسم الملف
                  </th>
                  <th className="px-6 py-3 font-bold text-primary text-sm hidden md:table-cell">
                    التصنيف
                  </th>
                  <th className="px-6 py-3 font-bold text-primary text-sm hidden sm:table-cell">
                    تاريخ الرفع
                  </th>
                  <th className="px-6 py-3 font-bold text-primary text-sm">
                    الحالة
                  </th>
                  <th className="px-6 py-3 font-bold text-primary text-sm">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400">
                      <div className="text-5xl mb-3 flex items-center justify-center text-primary">
                        <FaFolderOpen />
                      </div>
                      <p className="font-semibold">لا توجد ملفات بهذه الحالة</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((file, i) => {
                    const s = statusConfig[file.status];
                    return (
                      <motion.tr
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="border-b border-gray-50 hover:bg-bgSection transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-accent shrink-0">
                              <FiFileText size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-primary text-sm">
                                {file.title}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {formatSize(file.sizeBytes)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm font-semibold hidden md:table-cell">
                          {fileTypeLabel[file.type] || file.type}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm hidden sm:table-cell">
                          {new Date(file.createdAt).toLocaleDateString("ar")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.className}`}
                          >
                            {s.icon}
                            {s.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/majors/${file.ownerId}/summaries`}
                              className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors"
                              title="عرض صفحة الملخصات"
                            >
                              <FiEye size={16} />
                            </Link>
                            <button
                              onClick={() => handleDownload(file.id)}
                              className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors"
                            >
                              <FiDownload size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
