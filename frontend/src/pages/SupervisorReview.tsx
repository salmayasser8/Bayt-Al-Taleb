import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FaCheck, FaTimes, FaFilePdf } from "react-icons/fa";
import {
  MdPendingActions,
  MdTaskAlt,
  MdDangerous,
  MdLightbulb,
  MdTrendingUp,
} from "react-icons/md";
import { getReviewQueue, approveFile, rejectFile } from "@/api/reviews";
import { FaFolderOpen } from "react-icons/fa";
import Pagination from "@/components/common/Pagination";

// ── Types ─────────────────────────────────────────────────────────────

interface FileReview {
  id: string;
  title: string;
  type: "SUMMARY" | "PREVIOUS_EXAM" | "SYLLABUS" | "OTHER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  storageKey: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
  };
}

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";
type SortOption = "newest" | "oldest";

// ── Animations ────────────────────────────────────────────────────────

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
  visible: { transition: { staggerChildren: 0.08 } },
};

// ── Helpers ───────────────────────────────────────────────────────────

const fileTypeLabel: Record<string, string> = {
  SUMMARY: "ملخص شامل",
  PREVIOUS_EXAM: "أسئلة تدريبية",
  SYLLABUS: "خطة مساق",
  OTHER: "ملف آخر",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-600" },
  APPROVED: { label: "معتمد", color: "bg-green-100 text-green-600" },
  REJECTED: { label: "مرفوض", color: "bg-red-100 text-red-400" },
};

const getInitials = (name: string | undefined) => {
  if (!name) return "؟";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// ── Main Page ─────────────────────────────────────────────────────────

const SupervisorReview: React.FC = () => {
  const { toast } = useToast();

  const [files, setFiles] = useState<FileReview[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Fetch files ───────────────────────────────────────────────────────

  const fetchFiles = async () => {
    try {
      const data = await getReviewQueue();
      setFiles(
        Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data?.items)
            ? data.data.items
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [],
      );
    } catch {
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (files.length > 0) console.log("file structure:", files[0]);
  }, [files]);
  // ── Actions ───────────────────────────────────────────────────────────

  const handleApprove = async (fileId: string) => {
    setProcessingId(fileId);
    try {
      await approveFile(fileId);
      toast({ title: "تم الاعتماد ✅" });
      fetchFiles();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل اعتماد الملف",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal.id);
    try {
      await rejectFile(rejectModal.id, rejectReason);
      toast({ title: "تم الرفض" });
      setRejectModal(null);
      setRejectReason("");
      fetchFiles();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل رفض الملف",
      });
    } finally {
      setProcessingId(null);
    }
  };
  // ── Filter & sort ─────────────────────────────────────────────────────

  const filtered = files
    .filter((f) => filterStatus === "ALL" || f.status === filterStatus)
    .sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? db - da : da - db;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedFiles = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ── KPIs ──────────────────────────────────────────────────────────────

  const pending = files.filter((f) => f.status === "PENDING").length;
  const approved = files.filter((f) => f.status === "APPROVED").length;
  const rejected = files.filter((f) => f.status === "REJECTED").length;
  const acceptRate =
    files.length > 0 ? Math.round((approved / files.length) * 100) : 0;

  const kpis = [
    {
      label: "قيد المراجعة",
      value: pending,
      icon: <MdPendingActions size={24} />,
      color: "bg-yellow-100 text-yellow-600",
      sub: pending > 0 ? `${pending} ملف بانتظارك` : "لا توجد ملفات معلقة",
    },
    {
      label: "تم اعتمادها",
      value: approved,
      icon: <MdTaskAlt size={24} />,
      color: "bg-green-100 text-green-600",
      sub: `${acceptRate}% نسبة القبول`,
    },
    {
      label: "تم رفضها",
      value: rejected,
      icon: <MdDangerous size={24} />,
      color: "bg-red-100 text-red-400",
      sub: "يحتاج لإعادة الرفع",
    },
  ];

  const filterTabs: { value: FilterStatus; label: string }[] = [
    { value: "ALL", label: "الكل" },
    { value: "PENDING", label: "قيد المراجعة" },
    { value: "APPROVED", label: "معتمد" },
    { value: "REJECTED", label: "مرفوض" },
  ];

  return (
    <div className="min-h-screen bg-bgSection">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="font-bold text-3xl text-primary mb-1">
            لوحة مراجعة المحتوى
          </h1>
          <p className="text-gray-500">
            مراجعة واعتماد الملفات الدراسية المرفوعة من الطلاب
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          variants={container}
          viewport={{ once: false, amount: 0.5 }}
          whileInView="visible"
          initial="hidden"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              variants={cardPopUp}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 border border-gray-200 hover:border-primary"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${kpi.color}`}
              >
                {kpi.icon}
              </div>
              <div>
                <div className="font-bold text-3xl text-primary">
                  {String(kpi.value)}
                </div>
                <div className="font-semibold text-primary text-sm">
                  {kpi.label}
                </div>
                <div className="text-gray-400 text-sm font-semibold mt-0.5">
                  {kpi.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Files Table */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="font-bold text-xl text-primary">
              ملفات قيد المراجعة
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary text-primary bg-white"
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
            </select>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-gray-100 px-2 overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setFilterStatus(tab.value);
                  setCurrentPage(1); // Reset page on filter change
                }}
                className={`px-4 py-3 font-bold text-sm whitespace-nowrap transition-colors ${
                  filterStatus === tab.value
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400 hover:text-primary"
                }`}
              >
                {tab.label}
                {tab.value === "PENDING" && pending > 0 && (
                  <span className="mr-2 bg-yellow-100 text-yellow-600 text-xs px-2 py-0.5 rounded-full">
                    {pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ✅ Single ternary — empty state OR table, not both */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4 flex items-center justify-center text-primary">
                <FaFolderOpen size={40} />
              </div>
              <p className="font-semibold">لا توجد ملفات في هذه الفئة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-primary/5 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-primary">
                      العضو
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-primary">
                      الملف
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-primary">
                      النوع
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-primary">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-primary">
                      التاريخ
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-primary">
                      إجراء
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFiles.map((file, i) => (
                    <tr
                      key={file.id}
                      className={`border-t border-gray-100 hover:bg-bgSection transition-colors ${
                        i === paginatedFiles.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary text-paragraph flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {getInitials(file.uploadedBy?.fullName || "?")}
                          </div>
                          <div>
                            <div className="font-bold text-primary text-sm">
                              {file.uploadedBy?.fullName}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {file.uploadedBy?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaFilePdf
                            className="text-red-400 flex-shrink-0"
                            size={16}
                          />
                          <span className="font-semibold text-primary text-sm">
                            {file.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">
                          {fileTypeLabel[file.type] || file.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold ${statusConfig[file.status]?.color}`}
                        >
                          {statusConfig[file.status]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(file.createdAt).toLocaleDateString("ar")}
                      </td>
                      <td className="px-6 py-4">
                        {file.status === "PENDING" ? (
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprove(file.id)}
                              disabled={processingId === file.id}
                              className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-green-600 transition-colors disabled:opacity-60"
                            >
                              <FaCheck size={12} /> اعتماد
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                setRejectModal({
                                  id: file.id,
                                  title: file.title,
                                })
                              }
                              disabled={processingId === file.id}
                              className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-red-600 transition-colors disabled:opacity-60"
                            >
                              <FaTimes size={12} /> رفض
                            </motion.button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 gap-4">
              <div className="text-gray-400 text-sm">
                عرض {(currentPage - 1) * itemsPerPage + 1} إلى{" "}
                {Math.min(currentPage * itemsPerPage, filtered.length)} من أصل{" "}
                {filtered.length} ملف
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </motion.div>

        {/* Tips */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
              <MdLightbulb size={22} />
            </div>
            <div>
              <h4 className="font-bold text-primary mb-1">نصيحة المراجعة</h4>
              <p className="text-gray-500 text-sm font-semibold">
                رجى التأكد من مطابقة جميع الملفات لبروتوكول وزارة الصحة المحدث
                لعام 2026 قبل الاعتماد النهائي.
              </p>
            </div>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <MdTrendingUp size={22} />
            </div>
            <div>
              <h4 className="font-bold text-primary mb-1">نشاط القسم</h4>
              <p className="text-gray-500 text-sm font-semibold">
                زاد معدل رفع الملفات بنسبة 15% خلال الأسبوع الحالي. عمل رائع من
                الطلاب!
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setRejectModal(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-primary">رفض الملف</h3>
              <button
                onClick={() => setRejectModal(null)}
                className="text-gray-400 hover:text-primary"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              ملف:{" "}
              <span className="font-bold text-primary">
                {rejectModal.title}
              </span>
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض هنا (سيتم إشعار الطالب)..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-primary resize-none mb-4"
            />
            <div className="flex gap-3">
              <motion.button
                onClick={handleReject}
                disabled={
                  !rejectReason.trim() || processingId === rejectModal.id
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {processingId === rejectModal.id
                  ? "جاري الرفض..."
                  : "تأكيد الرفض"}
              </motion.button>
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 bg-bgSection text-primary font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SupervisorReview;
