import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiError } from "react-icons/bi";
// ── Types ──
export interface Role {
  id: string;
  name: "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "MEMBER";
}

export interface CollegeItem {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  slug: string;
}
export interface MajorItem {
  id: string;
  name: string;
  degree: string;
  collegeId: string;
  isActive: boolean;
  slug: string;
}
export interface ScholarshipItem {
  id: string;
  name: string;
  isActive: boolean;
  slug: string;
}
export type AdminTab =
  | "users"
  | "moderators"
  | "colleges"
  | "majors"
  | "scholarships"
  | "content";

// ── Constants ──
export const ROLES: Role[] = [
  { id: "cmqz2ux6d000gt3a45vzw96uj", name: "SUPER_ADMIN" },
  { id: "cmqz2ux81000ht3a44p0dh4qf", name: "ADMIN" },
  { id: "cmqz2ux8y000it3a4olfcw91e", name: "MODERATOR" },
  { id: "cmqz2ux9m000jt3a4ajat4kmu", name: "MEMBER" },
];

export const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "سوبر أدمن",
  ADMIN: "مشرف عام",
  MODERATOR: "مشرف مراجعة",
  MEMBER: "عضو",
};
export const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-600",
  ADMIN: "bg-purple-100 text-purple-600",
  MODERATOR: "bg-blue-100 text-blue-600",
  MEMBER: "bg-gray-100 text-gray-600",
};
export const inputStyle =
  "w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-primary bg-white";

// ── Badges ──
export const RoleBadge = ({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) => (
  <span
    className={`px-2 py-1 rounded-full font-bold ${
      className || "text-xs"
    } ${roleColors[name] || "bg-gray-100 text-gray-600"}`}
  >
    {roleLabels[name] || name}
  </span>
);
export const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span
    className={`px-2 py-1 rounded-full text-sm font-bold ${isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-400"}`}
  >
    {isActive ? "نشط" : "معلق"}
  </span>
);

// ── FormPanel (MUST be outside parent to fix toggle bug) ──
export const FormPanel: React.FC<{
  show: boolean;
  children: React.ReactNode;
}> = ({ show, children }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="border-b border-gray-100 overflow-hidden bg-bgSection"
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {children}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Confirm Modal ──
export const ConfirmModal: React.FC<{
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-sm p-6 text-center">
        <div className="text-6xl mb-4 text-red-500 flex items-center justify-center">
          <BiError />
        </div>
        <h3 className="font-bold text-xl text-primary mb-2">تأكيد الحذف</h3>
        <p className="text-gray-500 mb-6">
          هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors"
          >
            نعم، احذف
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-bgSection text-primary font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </>
  );
};
