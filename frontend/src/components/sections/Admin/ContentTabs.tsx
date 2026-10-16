import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { getMajors } from "@/api/majors";
import { getScholarships } from "@/api/scholarships";
import api from "@/api/axios";
import Button from "@/components/common/Button";
import { ConfirmModal, inputStyle } from "./shared";
// ── Types ─────────────────────────────────────────────────────────────

interface Section {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

interface Course {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  year: number;
  semester: string;
  majorId: string;
  credits: number;
}

// ── Helpers ───────────────────────────────────────────────────────────

const parseContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed
        .map(
          (item: any) =>
            item.label ||
            item.name ||
            item.title ||
            item.level ||
            JSON.stringify(item),
        )
        .join(" • ");
    }
    if (typeof parsed === "object") {
      return Object.entries(parsed)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");
    }
    return content;
  } catch {
    return content;
  }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── Section Content Form ──────────────────────────────────────────────

const SECTION_TEMPLATES: Record<string, string> = {
  "شرح عام": "نص عادي هنا...",
  universities: JSON.stringify(
    [{ name: "اسم الجامعة", location: "المدينة", link: "#" }],
    null,
    2,
  ),
  jobs: JSON.stringify(
    [{ icon: "FaHospitalAlt", label: "اسم مجال العمل" }],
    null,
    2,
  ),
  salaries: JSON.stringify(
    [{ level: "المستوى", range: "₪X,XXX - ₪X,XXX", note: "ملاحظة" }],
    null,
    2,
  ),
  degrees: JSON.stringify(["تخصص دقيق 1", "تخصص دقيق 2"], null, 2),
  "قيمة المنحة": "X,000 - X,000 شيكل للسنة الأكاديمية\nتفاصيل إضافية هنا",
  "ساعات التطوع": "نص يصف متطلبات التطوع أو عدم وجودها",
  "شروط القبول": JSON.stringify(
    [{ title: "شرط 1", desc: "وصف الشرط" }],
    null,
    2,
  ),
  "طريقة التسجيل": JSON.stringify(
    [{ title: "الخطوة الأولى", desc: "وصف الخطوة" }],
    null,
    2,
  ),
  "جهات اتصال": JSON.stringify(
    {
      email: "example@domain.com",
      phone: "+970 X XXX XXXX",
      website: "www.example.com",
      hours: "الأحد - الخميس (8:00 ص - 3:00 م)",
      registrationLink: "#",
    },
    null,
    2,
  ),
};

// ── FormPanel (stable reference, not inside component) ─────────────────

const FormPanel: React.FC<{ show: boolean; children: React.ReactNode }> = ({
  show,
  children,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden bg-bgSection border-b border-gray-100"
      >
        <div className="p-4 flex flex-col gap-3">{children}</div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Entity Content Manager ────────────────────────────────────────────

interface EntityContentProps {
  entityType: "MAJOR" | "SCHOLARSHIP";
  entityId: string;
  hasFaqs: boolean;
}

const EntityContent: React.FC<EntityContentProps> = ({
  entityType,
  entityId,
  hasFaqs,
}) => {
  const { toast } = useToast();
  const [activeInner, setActiveInner] = useState<"sections" | "faqs">(
    "sections",
  );
  const [sections, setSections] = useState<Section[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [editFaq, setEditFaq] = useState<Faq | null>(null);
  const [sectionForm, setSectionForm] = useState({
    title: "",
    content: "",
    sortOrder: 1,
  });
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    sortOrder: 1,
  });
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/content/${entityType}/${entityId}/sections`);
      setSections(res.data?.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchFaqs = async () => {
    try {
      const res = await api.get(`/content/${entityType}/${entityId}/faqs`);
      setFaqs(res.data?.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchSections();
    if (hasFaqs) fetchFaqs();
  }, [entityId]);

  const handleSaveSection = async () => {
    try {
      if (editSection) {
        await api.patch(`/content/sections/${editSection.id}`, sectionForm);
        toast({ title: "تم التحديث" });
        setEditSection(null);
      } else {
        await api.post(
          `/content/${entityType}/${entityId}/sections`,
          sectionForm,
        );
        toast({ title: "تمت الإضافة" });
        setShowAddSection(false);
      }
      setSectionForm({
        title: "",
        content: "",
        sortOrder: sections.length + 1,
      });
      fetchSections();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حفظ القسم",
      });
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteSectionId) return;
    try {
      await api.delete(`/content/sections/${deleteSectionId}`);
      toast({ title: "تم الحذف" });
      fetchSections();
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحذف" });
    } finally {
      setDeleteSectionId(null);
    }
  };

  const handleSaveFaq = async () => {
    try {
      if (editFaq) {
        await api.patch(`/content/faqs/${editFaq.id}`, faqForm);
        toast({ title: "تم التحديث" });
        setEditFaq(null);
      } else {
        await api.post(`/content/${entityType}/${entityId}/faqs`, faqForm);
        toast({ title: "تمت الإضافة" });
        setShowAddFaq(false);
      }
      setFaqForm({ question: "", answer: "", sortOrder: faqs.length + 1 });
      fetchFaqs();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حفظ السؤال",
      });
    }
  };

  const handleDeleteFaq = async () => {
    if (!deleteFaqId) return;
    try {
      await api.delete(`/content/faqs/${deleteFaqId}`);
      toast({ title: "تم الحذف" });
      fetchFaqs();
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحذف" });
    } finally {
      setDeleteFaqId(null);
    }
  };

  const openEditSection = (s: Section) => {
    setEditSection(s);
    setSectionForm({
      title: s.title,
      content: s.content,
      sortOrder: s.sortOrder,
    });
    setShowAddSection(false);
  };

  const openEditFaq = (f: Faq) => {
    setEditFaq(f);
    setFaqForm({
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
    });
    setShowAddFaq(false);
  };

  const applyTemplate = (title: string) => {
    const template = SECTION_TEMPLATES[title];
    if (template) setSectionForm((p) => ({ ...p, content: template }));
  };

  return (
    <div>
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveInner("sections")}
          className={`flex-1 py-3 font-bold text-sm transition-colors ${activeInner === "sections" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-primary"}`}
        >
          الأقسام ({sections.length})
        </button>
        {hasFaqs && (
          <button
            onClick={() => setActiveInner("faqs")}
            className={`flex-1 py-3 font-bold text-sm transition-colors ${activeInner === "faqs" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-primary"}`}
          >
            أسئلة شائعة ({faqs.length})
          </button>
        )}
      </div>

      {activeInner === "sections" && (
        <div>
          <div className="px-4 py-3 flex justify-end border-b border-gray-100">
            <button
              onClick={() => {
                setShowAddSection(!showAddSection);
                setEditSection(null);
                setSectionForm({
                  title: "",
                  content: "",
                  sortOrder: sections.length + 1,
                });
              }}
              className="flex items-center gap-2 bg-primary text-paragraph px-3 py-2 rounded-xl font-bold text-sm hover:bg-primaryLight transition-colors"
            >
              <FaPlus size={10} /> إضافة قسم
            </button>
          </div>

          <FormPanel show={showAddSection || !!editSection}>
            <div className="flex gap-2">
              <input
                placeholder="عنوان القسم *"
                value={sectionForm.title}
                onChange={(e) => {
                  setSectionForm((p) => ({ ...p, title: e.target.value }));
                  applyTemplate(e.target.value);
                }}
                className={`${inputStyle} flex-1`}
              />
              <input
                type="number"
                placeholder="الترتيب"
                value={sectionForm.sortOrder}
                onChange={(e) =>
                  setSectionForm((p) => ({
                    ...p,
                    sortOrder: Number(e.target.value),
                  }))
                }
                className="w-24 border border-gray-300 rounded-xl px-3 py-3 outline-none focus:border-primary text-primary bg-white text-sm"
              />
            </div>
            <p className="text-xs text-gray-400">
              نصيحة: اكتب عنواناً مثل "شرح عام" أو "universities" وسيتم تعبئة
              قالب المحتوى تلقائياً
            </p>
            <textarea
              rows={6}
              placeholder="المحتوى..."
              value={sectionForm.content}
              onChange={(e) =>
                setSectionForm((p) => ({ ...p, content: e.target.value }))
              }
              className={`${inputStyle} resize-none font-mono text-xs`}
            />
            <div className="flex gap-3 justify-center">
              <Button onClick={handleSaveSection} className="w-80">
                {editSection ? "حفظ التعديلات" : "إضافة"}
              </Button>
              <button
                onClick={() => {
                  setShowAddSection(false);
                  setEditSection(null);
                }}
                className="p-2 w-24 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </FormPanel>

          {loading ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              جاري التحميل...
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              لا توجد أقسام بعد
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sections
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((section) => (
                  <div
                    key={section.id}
                    className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-bgSection"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm bg-primary/10 text-accent px-2 py-1 rounded-full font-bold">
                          {section.sortOrder}
                        </span>
                        <span className="font-bold text-primary text-sm">
                          {section.title}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs truncate">
                        {parseContent(section.content).substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditSection(section)}
                        className="text-primary hover:text-accent transition-colors"
                      >
                        <FaEdit size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteSectionId(section.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash size={15} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeInner === "faqs" && hasFaqs && (
        <div>
          <div className="px-4 py-3 flex justify-end border-b border-gray-100">
            <button
              onClick={() => {
                setShowAddFaq(!showAddFaq);
                setEditFaq(null);
                setFaqForm({
                  question: "",
                  answer: "",
                  sortOrder: faqs.length + 1,
                });
              }}
              className="flex items-center gap-2 bg-primary text-paragraph px-3 py-2 rounded-xl font-bold text-sm hover:bg-primaryLight transition-colors"
            >
              <FaPlus size={10} /> إضافة سؤال
            </button>
          </div>

          <FormPanel show={showAddFaq || !!editFaq}>
            <input
              placeholder="السؤال *"
              value={faqForm.question}
              onChange={(e) =>
                setFaqForm((p) => ({ ...p, question: e.target.value }))
              }
              className={inputStyle}
            />
            <textarea
              rows={3}
              placeholder="الجواب *"
              value={faqForm.answer}
              onChange={(e) =>
                setFaqForm((p) => ({ ...p, answer: e.target.value }))
              }
              className={`${inputStyle} resize-none`}
            />
            <input
              type="number"
              placeholder="الترتيب"
              value={faqForm.sortOrder}
              onChange={(e) =>
                setFaqForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))
              }
              className={inputStyle}
            />
            <div className="flex gap-3 justify-center">
              <Button onClick={handleSaveFaq} className="w-80">
                {editFaq ? "حفظ التعديلات" : "إضافة"}
              </Button>
              <button
                onClick={() => {
                  setShowAddFaq(false);
                  setEditFaq(null);
                }}
                className="p-2 w-24 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </FormPanel>

          {faqs.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              لا توجد أسئلة بعد
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {faqs
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((faq) => (
                  <div
                    key={faq.id}
                    className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-bgSection"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-primary text-sm mb-1">
                        {faq.question}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {faq.answer.substring(0, 80)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditFaq(faq)}
                        className="text-primary hover:text-accent transition-colors"
                      >
                        <FaEdit size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteFaqId(faq.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash size={15} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        show={!!deleteSectionId}
        onConfirm={handleDeleteSection}
        onCancel={() => setDeleteSectionId(null)}
      />
      <ConfirmModal
        show={!!deleteFaqId}
        onConfirm={handleDeleteFaq}
        onCancel={() => setDeleteFaqId(null)}
      />
    </div>
  );
};

// ── Courses Manager ───────────────────────────────────────────────────

interface CoursesManagerProps {
  majorId: string;
  onCourseChange?: () => void;
}

const CoursesManager: React.FC<CoursesManagerProps> = ({
  majorId,
  onCourseChange,
}) => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    nameAr: "",
    code: "",
    year: 1,
    semester: "أول",
    credits: 3,
  });

  const fetchCourses = async () => {
    try {
      const res = await api.get(`/majors/${majorId}/courses`);
      const list = Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
      setCourses(list);
    } catch {}
  };

  useEffect(() => {
    fetchCourses();
  }, [majorId]);

  const openAdd = () => {
    setEditItem(null);
    setForm({
      name: "",
      nameAr: "",
      code: "",
      year: 1,
      semester: "أول",
      credits: 3,
    });
    setShowForm(true);
  };

  const openEdit = (c: Course) => {
    setEditItem(c);
    setForm({
      name: c.name,
      nameAr: c.nameAr,
      code: c.code,
      year: c.year,
      semester: c.semester,
      credits: c.credits,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.patch(`/courses/${editItem.id}`, form);
        toast({ title: "تم التحديث", description: "تم تحديث المساق" });
      } else {
        await api.post(`/majors/${majorId}/courses`, form);
        toast({ title: "تمت الإضافة", description: "تمت إضافة المساق" });
      }
      setShowForm(false);
      setEditItem(null);
      fetchCourses();
      onCourseChange?.();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حفظ المساق",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/courses/${deleteId}`);
      toast({ title: "تم الحذف", description: "تم حذف المساق" });
      setDeleteId(null);
      fetchCourses();
      onCourseChange?.();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حذف المساق",
      });
    }
  };

  return (
    <div>
      <div className="px-4 py-3 flex justify-end border-b border-gray-100">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-paragraph px-3 py-2 rounded-xl font-bold text-sm hover:bg-primaryLight transition-colors"
        >
          <FaPlus size={10} /> إضافة مساق
        </button>
      </div>

      <FormPanel show={showForm}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            placeholder="اسم المساق (عربي) *"
            value={form.nameAr}
            onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
            className={inputStyle}
          />
          <input
            placeholder="اسم المساق (إنجليزي) *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputStyle}
          />
          <input
            placeholder="رمز المساق (e.g. NURS101) *"
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
            className={inputStyle}
          />
          <input
            placeholder="عدد الساعات (default: 3)"
            type="number"
            value={form.credits}
            onChange={(e) =>
              setForm((p) => ({ ...p, credits: Number(e.target.value) }))
            }
            className={inputStyle}
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-primary mb-1 block">
                السنة
              </label>
              <select
                value={form.year}
                onChange={(e) =>
                  setForm((p) => ({ ...p, year: Number(e.target.value) }))
                }
                className={inputStyle}
              >
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <option key={y} value={y}>
                    السنة {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-primary mb-1 block">
                الفصل
              </label>
              <select
                value={form.semester}
                onChange={(e) =>
                  setForm((p) => ({ ...p, semester: e.target.value }))
                }
                className={inputStyle}
              >
                <option value="أول">أول</option>
                <option value="ثاني">ثاني</option>
                <option value="صيفي">صيفي</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-center md:col-span-2">
          <Button onClick={handleSave} className="w-80">
            {editItem ? "حفظ التعديلات" : "إضافة المساق"}
          </Button>
          <button
            onClick={() => {
              setShowForm(false);
              setEditItem(null);
            }}
            className="p-2 w-24 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </FormPanel>

      {courses.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          <div className="text-3xl mb-2">📚</div>
          لا توجد مساقات لهذا التخصص بعد
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-primary/5 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-sm font-bold text-primary">
                  المساق
                </th>
                <th className="px-4 py-3 text-sm font-bold text-primary">
                  الرمز
                </th>
                <th className="px-4 py-3 text-sm font-bold text-primary">
                  السنة
                </th>
                <th className="px-4 py-3 text-sm font-bold text-primary">
                  الفصل
                </th>
                <th className="px-4 py-3 text-sm font-bold text-primary">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-100 hover:bg-bgSection transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary text-sm">
                        {c.nameAr}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm font-mono">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{c.year}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {c.semester}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
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
        </div>
      )}

      <ConfirmModal
        show={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

// ── Main ContentTab ───────────────────────────────────────────────────

const ContentTab: React.FC = () => {
  const [majors, setMajors] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<{
    id: string;
    name: string;
    type: "MAJOR" | "SCHOLARSHIP";
  } | null>(null);
  const [entityCategory, setEntityCategory] = useState<"MAJOR" | "SCHOLARSHIP">(
    "MAJOR",
  );

  useEffect(() => {
    getMajors().then((res) => setMajors(res.data?.items || res.data || []));
    getScholarships().then((res) =>
      setScholarships(res.data?.items || res.data || []),
    );
  }, []);

  const currentList = entityCategory === "MAJOR" ? majors : scholarships;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <h2 className="font-bold text-xl text-primary">إدارة المحتوى</h2>

      {/* Entity type selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => {
              setEntityCategory("MAJOR");
              setSelectedEntity(null);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-md transition-colors ${entityCategory === "MAJOR" ? "bg-primary text-paragraph" : "bg-bgSection text-primary hover:bg-gray-200"}`}
          >
            تخصص أكاديمي
          </button>
          <button
            onClick={() => {
              setEntityCategory("SCHOLARSHIP");
              setSelectedEntity(null);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-md transition-colors ${entityCategory === "SCHOLARSHIP" ? "bg-primary text-paragraph" : "bg-bgSection text-primary hover:bg-gray-200"}`}
          >
            منحة دراسية
          </button>
        </div>

        <select
          value={selectedEntity?.id || ""}
          onChange={(e) => {
            const item = currentList.find((i) => i.id === e.target.value);
            if (item)
              setSelectedEntity({
                id: item.id,
                name: item.name,
                type: entityCategory,
              });
            else setSelectedEntity(null);
          }}
          className="w-full md:w-[30%] mx-auto block mt-6 border border-gray-300 rounded-xl p-3 outline-none focus:border-primary transition-colors text-primary bg-white font-semibold"
        >
          <option value="">
            اختر {entityCategory === "MAJOR" ? "تخصصاً" : "منحة"} لإدارة محتواه
          </option>
          {currentList.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Courses section — only for MAJORS */}
      {selectedEntity?.type === "MAJOR" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-primary/5">
            <h3 className="font-bold text-lg text-primary">
              المساقات الدراسية — {selectedEntity.name}
            </h3>
          </div>
          <CoursesManager majorId={selectedEntity.id} />
        </div>
      )}

      {/* Sections & FAQs */}
      {selectedEntity && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-primary/5">
            <h3 className="font-bold text-lg text-primary">
              محتوى: {selectedEntity.name}
            </h3>
          </div>
          <EntityContent
            key={selectedEntity.id}
            entityType={selectedEntity.type}
            entityId={selectedEntity.id}
            hasFaqs={selectedEntity.type === "MAJOR"}
          />
        </div>
      )}
    </motion.div>
  );
};

export default ContentTab;
