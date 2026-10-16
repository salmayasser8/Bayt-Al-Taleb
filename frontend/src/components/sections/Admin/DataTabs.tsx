import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import type { CollegeItem, MajorItem, ScholarshipItem } from "./shared";
import { inputStyle, StatusBadge, FormPanel, ConfirmModal } from "./shared";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";
import { getColleges } from "@/api/colleges";
import { getMajors } from "@/api/majors";
import { getScholarships } from "@/api/scholarships";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── Colleges ────────────────────────────────────────────────

const collegeEmpty = { name: "", slug: "", category: "", description: "" };

export const CollegesTab: React.FC<{ onRefresh: () => void }> = ({
  onRefresh,
}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<CollegeItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<CollegeItem | null>(null);
  const [form, setForm] = useState(collegeEmpty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const fetch = async () => {
    try {
      const res = await getColleges();
      const data = res.data?.items || res.data;
      setItems(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    fetch();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(collegeEmpty);
    setShowForm(true);
  };
  const openEdit = (c: CollegeItem) => {
    setEditItem(c);
    setForm({
      name: c.name,
      slug: c.slug,
      category: c.category,
      description: "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.patch(`/colleges/${editItem.id}`, form);
        toast({ title: "تم التحديث", description: "تم تحديث الكلية" });
      } else {
        await api.post("/colleges", form);
        toast({ title: "تمت الإضافة", description: "تمت إضافة الكلية" });
      }
      setShowForm(false);
      setEditItem(null);
      setForm(collegeEmpty);
      fetch();
      onRefresh();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حفظ الكلية",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/colleges/${deleteId}`);
      toast({ title: "تم الحذف" });
      setDeleteId(null);
      fetch();
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast({
          variant: "destructive",
          title: "لا يمكن الحذف",
          description: "يجب حذف جميع التخصصات المرتبطة بهذه الكلية أولاً",
        });
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل حذف الكلية",
        });
      }
    }
  };
  return (
    <>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-xl text-primary">إدارة الكليات</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-paragraph px-4 py-2 rounded-xl font-bold text-sm hover:bg-primaryLight transition-colors"
          >
            <FaPlus size={12} /> إضافة كلية
          </button>
        </div>
        <FormPanel show={showForm}>
          <input
            placeholder="اسم الكلية *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputStyle}
          />
          <input
            placeholder="slug (e.g. medicine) *"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className={inputStyle}
          />
          <input
            placeholder="التصنيف (e.g. طب) *"
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({ ...p, category: e.target.value }))
            }
            className={inputStyle}
          />
          <input
            placeholder="الوصف (اختياري)"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            className={inputStyle}
          />
          <div className="md:col-span-2 flex justify-center gap-3">
            <Button onClick={handleSave} className="w-80">
              {editItem ? "حفظ التعديلات" : "إضافة الكلية"}
            </Button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditItem(null);
              }}
              className="p-2 w-24 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </FormPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-primary/5 border-b border-gray-200">
              <tr>
                {["اسم الكلية", "التصنيف", "الحالة", "إجراءات"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-sm font-bold text-primary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items
                .slice(
                  (currentPage - 1) * ITEMS_PER_PAGE,
                  currentPage * ITEMS_PER_PAGE
                )
                .map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-100 hover:bg-bgSection"
                >
                  <td className="px-6 py-4 font-bold text-primary">{c.name}</td>
                  <td className="px-6 py-4 text-gray-500">{c.category}</td>
                  <td className="px-6 py-4">
                    <StatusBadge isActive={c.isActive} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-primary hover:text-accent transition-colors"
                      >
                        <FaEdit size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Math.ceil(items.length / ITEMS_PER_PAGE) > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(items.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </motion.div>
      <ConfirmModal
        show={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
};

// ── Majors ──────────────────────────────────────────────────

const majorEmpty = { name: "", slug: "", degree: "", collegeId: "" };

export const MajorsTab: React.FC<{ onRefresh: () => void }> = ({
  onRefresh,
}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<MajorItem[]>([]);
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MajorItem | null>(null);
  const [form, setForm] = useState(majorEmpty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // ✅ FIXED: use your original getMajors + safe array fallback
  const fetch = async () => {
    try {
      const res = await getMajors();
      const data = res.data?.items || res.data;
      setItems(Array.isArray(data) ? data : []);
    } catch {}
  };

  const fetchColleges = async () => {
    try {
      const res = await getColleges();
      const data = res.data?.items || res.data;
      setColleges(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    fetch();
    fetchColleges();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(majorEmpty);
    setShowForm(true);
  };
  const openEdit = (m: MajorItem) => {
    setEditItem(m);
    setForm({
      name: m.name,
      slug: m.slug,
      degree: m.degree,
      collegeId: m.collegeId,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.patch(`/majors/${editItem.id}`, form);
        toast({ title: "تم التحديث", description: "تم تحديث التخصص" });
      } else {
        await api.post("/majors", form);
        toast({ title: "تمت الإضافة", description: "تمت إضافة التخصص" });
      }
      setShowForm(false);
      setEditItem(null);
      setForm(majorEmpty);
      fetch();
      onRefresh();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حفظ التخصص",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/majors/${deleteId}`);
      toast({ title: "تم الحذف", description: "تم حذف التخصص" });
      setDeleteId(null);
      fetch();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حذف التخصص",
      });
    }
  };

  return (
    <>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-xl text-primary">إدارة التخصصات</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-paragraph px-4 py-2 rounded-xl font-bold text-sm hover:bg-primaryLight transition-colors"
          >
            <FaPlus size={12} /> إضافة تخصص
          </button>
        </div>
        <FormPanel show={showForm}>
          <input
            placeholder="اسم التخصص *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputStyle}
          />
          <input
            placeholder="slug (e.g. nursing) *"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className={inputStyle}
          />
          <input
            placeholder="اللقب الأكاديمي (e.g. BSN) *"
            value={form.degree}
            onChange={(e) => setForm((p) => ({ ...p, degree: e.target.value }))}
            className={inputStyle}
          />
          <select
            value={form.collegeId}
            onChange={(e) =>
              setForm((p) => ({ ...p, collegeId: e.target.value }))
            }
            className={inputStyle}
          >
            <option value="">اختر الكلية</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="md:col-span-2 flex justify-center gap-3">
            <Button onClick={handleSave} className="w-80">
              {editItem ? "حفظ التعديلات" : "إضافة التخصص"}
            </Button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditItem(null);
              }}
              className="px-6 bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </FormPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-primary/5 border-b border-gray-200">
              <tr>
                {["التخصص", "اللقب", "الكلية", "الحالة", "إجراءات"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-sm font-bold text-primary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items
                .slice(
                  (currentPage - 1) * ITEMS_PER_PAGE,
                  currentPage * ITEMS_PER_PAGE
                )
                .map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-gray-100 hover:bg-bgSection"
                >
                  <td className="px-6 py-4 font-bold text-primary">{m.name}</td>
                  <td className="px-6 py-4 text-gray-500">{m.degree}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {colleges.find((c) => c.id === m.collegeId)?.name || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge isActive={m.isActive} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => openEdit(m)}
                        className="text-primary hover:text-accent transition-colors"
                      >
                        <FaEdit size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(m.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Math.ceil(items.length / ITEMS_PER_PAGE) > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(items.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </motion.div>
      <ConfirmModal
        show={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
};

// ── Scholarships ────────────────────────────────────────────

const scholarshipEmpty = { name: "", slug: "", isActive: true };

export const ScholarshipsTab: React.FC<{ onRefresh: () => void }> = ({
  onRefresh,
}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ScholarshipItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ScholarshipItem | null>(null);
  const [form, setForm] = useState(scholarshipEmpty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [currentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // ✅ FIXED: use your original getScholarships + safe array fallback
  const fetch = async () => {
    try {
      const res = await getScholarships();
      const data = res.data?.items || res.data;
      setItems(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    fetch();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(scholarshipEmpty);
    setShowForm(true);
  };
  const openEdit = (s: ScholarshipItem) => {
    setEditItem(s);
    setForm({ name: s.name, slug: s.slug, isActive: s.isActive });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.patch(`/scholarships/${editItem.id}`, form);
        toast({ title: "تم التحديث", description: "تم تحديث المنحة" });
      } else {
        await api.post("/scholarships", form);
        toast({ title: "تمت الإضافة", description: "تمت إضافة المنحة" });
      }
      setShowForm(false);
      setEditItem(null);
      setForm(scholarshipEmpty);
      fetch();
      onRefresh();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حفظ المنحة",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/scholarships/${deleteId}`);
      toast({ title: "تم الحذف", description: "تم حذف المنحة" });
      setDeleteId(null);
      fetch();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حذف المنحة",
      });
    }
  };

  return (
    <>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-xl text-primary">إدارة المنح</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-paragraph px-4 py-2 rounded-xl font-bold text-sm hover:bg-primaryLight transition-colors"
          >
            <FaPlus size={12} /> إضافة منحة
          </button>
        </div>
        <FormPanel show={showForm}>
          <input
            placeholder="اسم المنحة *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputStyle}
          />
          <input
            placeholder="slug (e.g. moe-scholarship) *"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className={inputStyle}
          />
          <div className="flex items-center gap-3">
            <label className="font-semibold text-primary text-sm">نشطة</label>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setForm((p) => ({ ...p, isActive: !p.isActive }));
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isActive ? "right-1" : "left-1"}`}
              />
            </button>
          </div>
          <div className="md:col-span-2 flex justify-center gap-3">
            <Button onClick={handleSave} className="w-80">
              {editItem ? "حفظ التعديلات" : "إضافة المنحة"}
            </Button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditItem(null);
              }}
              className="px-6 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </FormPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-primary/5 border-b border-gray-200">
              <tr>
                {["المنحة", "الحالة", "إجراءات"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-sm font-bold text-primary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items
                .slice(
                  (currentPage - 1) * ITEMS_PER_PAGE,
                  currentPage * ITEMS_PER_PAGE
                )
                .map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-gray-100 hover:bg-bgSection"
                >
                  <td className="px-6 py-4 font-bold text-primary">{s.name}</td>
                  <td className="px-6 py-4">
                    <StatusBadge isActive={s.isActive} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-primary hover:text-accent transition-colors"
                      >
                        <FaEdit size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(s.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      <ConfirmModal
        show={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
};
