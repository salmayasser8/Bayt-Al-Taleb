import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/store/AuthContext";
import { adminApi, AdminUser } from "@/api/admin";
import {
  FaSearch,
  FaTrash,
  FaEdit,
  FaTimes,
  FaBan,
  FaCheck,
} from "react-icons/fa";
import {
  ROLES,
  roleLabels,
  inputStyle,
  RoleBadge,
  StatusBadge,
  ConfirmModal,
} from "./shared";
import Pagination from "@/components/common/Pagination";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const usersTabKpiData = (users: AdminUser[]) => ({
  total: users.length,
  moderators: users.filter((u) => (u.role as string) === "MODERATOR").length,
  active: users.filter((u) => u.isActive).length,
  inactive: users.filter((u) => !u.isActive).length,
});

interface Props {
  onRefresh: () => void;
}

const UsersTab: React.FC<Props> = ({ onRefresh }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isActiveEdit, setIsActiveEdit] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchUsers = async (q = "") => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(1, q);
      setUsers(res.data?.items || res.data || []);
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تحميل المستخدمين",
      });
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const canEdit = (t: AdminUser) => {
    if (!user || t.id === user.id) return false;
    if (user.role === "SUPER_ADMIN") return true;
    if (user.role === "ADMIN")
      return t.role === "MEMBER" || t.role === "MODERATOR";
    return false;
  };

  const availableRoles = ROLES.filter((r) => {
    if (user?.role === "SUPER_ADMIN") return true;
    if (user?.role === "ADMIN")
      return r.name === "MEMBER" || r.name === "MODERATOR";
    return false;
  });

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setSelectedRoleId(
      ROLES.find((r) => r.name === (u.role as string))?.id || "",
    );
    setIsActiveEdit(u.isActive);
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await adminApi.updateUser(editUser.id, {
        roleId: selectedRoleId,
        isActive: isActiveEdit,
      });
      toast({ title: "تم التحديث", description: "تم تحديث بيانات المستخدم" });
      setEditUser(null);
      fetchUsers(search);
      onRefresh();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تحديث المستخدم",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (u: AdminUser) => {
    try {
      await adminApi.updateUser(u.id, { isActive: !u.isActive });
      toast({
        title: u.isActive ? "تم التعليق" : "تم التفعيل",
        description: u.fullName,
      });
      fetchUsers(search);
      onRefresh();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تغيير الحالة",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteUser(deleteId);
      toast({ title: "تم الحذف", description: "تم حذف المستخدم" });
      setDeleteId(null);
      fetchUsers(search);
      onRefresh();
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحذف" });
    }
  };

  const currentUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);

  return (
    <>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="font-bold text-xl text-primary">إدارة المستخدمين</h2>
          <div className="relative w-full sm:w-72">
            <FaSearch
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن مستخدم..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-9 outline-none focus:border-primary text-sm text-primary"
            />
          </div>
        </div>
        {loading ? (
          <div className="text-center py-16 text-gray-400">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-primary/5 border-b border-gray-200 =">
                <tr>
                  {[
                    "المستخدم",
                    "البريد",
                    "الدور",
                    "الحالة",
                    "التسجيل",
                    "إجراءات",
                  ].map((h) => (
                    <th
                      key={h}
                      className=" text-md px-6 py-4 font-bold text-primary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-gray-100 hover:bg-bgSection"
                  >
                    <td className="px-6 py-4 font-bold text-primary">
                      {u.fullName}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-semibold">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 ">
                      <RoleBadge name={u.role as string} className="text-sm" />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isActive={u.isActive} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(u.createdAt).toLocaleDateString("ar")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-start">
                        {canEdit(u) && (
                          <button
                            onClick={() => handleToggle(u)}
                            title={u.isActive ? "تعليق" : "تفعيل"}
                            className={
                              u.isActive
                                ? "text-orange-400 hover:text-orange-600"
                                : "text-green-500 hover:text-green-700"
                            }
                          >
                            {u.isActive ? (
                              <FaBan size={18} />
                            ) : (
                              <FaCheck size={18} />
                            )}
                          </button>
                        )}
                        {canEdit(u) && (
                          <button
                            onClick={() => openEdit(u)}
                            className="text-primary hover:text-accent transition-colors"
                          >
                            <FaEdit size={18} />
                          </button>
                        )}
                        {canEdit(u) && (
                          <button
                            onClick={() => setDeleteId(u.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <FaTrash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </motion.div>

      {editUser && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setEditUser(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-primary">تعديل المستخدم</h3>
              <button
                onClick={() => setEditUser(null)}
                className="text-gray-400 hover:text-primary"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-bgSection rounded-xl p-4">
                <p className="font-bold text-primary">{editUser.fullName}</p>
                <p className="text-gray-500 text-sm">{editUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-primary mb-1 block">
                  الدور
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className={inputStyle}
                >
                  {availableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {roleLabels[r.name]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-primary">
                  الحالة
                </label>
                <button
                  type="button"
                  onClick={() => setIsActiveEdit(!isActiveEdit)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isActiveEdit ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActiveEdit ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary text-paragraph font-bold py-3 rounded-xl hover:bg-primaryLight transition-colors disabled:opacity-60"
              >
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        show={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
};

export default UsersTab;
