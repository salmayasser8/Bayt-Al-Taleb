import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import api from "@/api/axios";

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

interface ContentManagerProps {
  entityType: "MAJOR" | "SCHOLARSHIP";
  entityId: string;
  entityName: string;
  hasFaqs?: boolean; // majors have faqs, scholarships don't
}

// ── Component ─────────────────────────────────────────────────────────

const ContentManager: React.FC<ContentManagerProps> = ({
  entityType,
  entityId,
  entityName,
  hasFaqs = false,
}) => {
  const { toast } = useToast();
  const [activeInner, setActiveInner] = useState<"sections" | "faqs">(
    "sections",
  );

  // Sections state
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [sectionForm, setSectionForm] = useState({
    title: "",
    content: "",
    sortOrder: 1,
  });

  // FAQs state
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [editFaq, setEditFaq] = useState<Faq | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    sortOrder: 1,
  });

  const inputStyle =
    "w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-primary bg-white text-sm";

  // ── Fetch ────────────────────────────────────────────────────────────

  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const res = await api.get(`/content/${entityType}/${entityId}/sections`);
      setSections(res.data?.data || []);
    } catch {
    } finally {
      setLoadingSections(false);
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

  // ── Section actions ───────────────────────────────────────────────────

  const handleSaveSection = async () => {
    try {
      if (editSection) {
        await api.patch(`/content/sections/${editSection.id}`, sectionForm);
        toast({ title: "تم التحديث", description: "تم تحديث القسم" });
        setEditSection(null);
      } else {
        await api.post(
          `/content/${entityType}/${entityId}/sections`,
          sectionForm,
        );
        toast({ title: "تمت الإضافة", description: "تمت إضافة القسم" });
        setShowAddSection(false);
      }
      setSectionForm({ title: "", content: "", sortOrder: 1 });
      fetchSections();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حفظ القسم",
      });
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      await api.delete(`/content/sections/${id}`);
      toast({ title: "تم الحذف", description: "تم حذف القسم" });
      fetchSections();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حذف القسم",
      });
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

  // ── FAQ actions ───────────────────────────────────────────────────────

  const handleSaveFaq = async () => {
    try {
      if (editFaq) {
        await api.patch(`/content/faqs/${editFaq.id}`, faqForm);
        toast({ title: "تم التحديث", description: "تم تحديث السؤال" });
        setEditFaq(null);
      } else {
        await api.post(`/content/${entityType}/${entityId}/faqs`, faqForm);
        toast({ title: "تمت الإضافة", description: "تمت إضافة السؤال" });
        setShowAddFaq(false);
      }
      setFaqForm({ question: "", answer: "", sortOrder: 1 });
      fetchFaqs();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حفظ السؤال",
      });
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await api.delete(`/content/faqs/${id}`);
      toast({ title: "تم الحذف" });
      fetchFaqs();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل حذف السؤال",
      });
    }
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

  // ── Form panel ────────────────────────────────────────────────────────

  const FormPanel = ({
    show,
    children,
  }: {
    show: boolean;
    children: React.ReactNode;
  }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-b border-gray-100 overflow-hidden bg-bgSection"
        >
          <div className="p-4 flex flex-col gap-3">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-primary/5">
        <h3 className="font-bold text-lg text-primary">محتوى: {entityName}</h3>
      </div>

      {/* Inner tabs */}
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
            الأسئلة الشائعة ({faqs.length})
          </button>
        )}
      </div>

      {/* ── Sections ── */}
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
              className="flex items-center gap-2 bg-primary text-paragraph px-3 py-2 rounded-xl font-bold text-xs hover:bg-primaryLight transition-colors"
            >
              <FaPlus size={10} /> إضافة قسم
            </button>
          </div>

          <FormPanel show={showAddSection || !!editSection}>
            <input
              placeholder="عنوان القسم (e.g. شرح عام أو universities)"
              value={sectionForm.title}
              onChange={(e) =>
                setSectionForm((p) => ({ ...p, title: e.target.value }))
              }
              className={inputStyle}
            />
            <textarea
              rows={4}
              placeholder="المحتوى (نص عادي أو JSON للأقسام المنظمة)"
              value={sectionForm.content}
              onChange={(e) =>
                setSectionForm((p) => ({ ...p, content: e.target.value }))
              }
              className={`${inputStyle} resize-none`}
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
              className={inputStyle}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveSection}
                className="flex-1 bg-primary text-paragraph font-bold py-2 rounded-xl hover:bg-primaryLight transition-colors text-sm"
              >
                {editSection ? "حفظ التعديلات" : "إضافة"}
              </button>
              <button
                onClick={() => {
                  setShowAddSection(false);
                  setEditSection(null);
                }}
                className="px-4 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                إلغاء
              </button>
            </div>
          </FormPanel>

          {loadingSections ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              جاري التحميل...
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              لا توجد أقسام — أضف أول قسم
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
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                          #{section.sortOrder}
                        </span>
                        <span className="font-bold text-primary text-sm">
                          {section.title}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs truncate">
                        {section.content.substring(0, 80)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditSection(section)}
                        className="text-primary hover:text-accent transition-colors"
                      >
                        <FaEdit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── FAQs ── */}
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
              className="flex items-center gap-2 bg-primary text-paragraph px-3 py-2 rounded-xl font-bold text-xs hover:bg-primaryLight transition-colors"
            >
              <FaPlus size={10} /> إضافة سؤال
            </button>
          </div>

          <FormPanel show={showAddFaq || !!editFaq}>
            <input
              placeholder="السؤال"
              value={faqForm.question}
              onChange={(e) =>
                setFaqForm((p) => ({ ...p, question: e.target.value }))
              }
              className={inputStyle}
            />
            <textarea
              rows={3}
              placeholder="الجواب"
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
            <div className="flex gap-3">
              <button
                onClick={handleSaveFaq}
                className="flex-1 bg-primary text-paragraph font-bold py-2 rounded-xl hover:bg-primaryLight transition-colors text-sm"
              >
                {editFaq ? "حفظ التعديلات" : "إضافة"}
              </button>
              <button
                onClick={() => {
                  setShowAddFaq(false);
                  setEditFaq(null);
                }}
                className="px-4 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                إلغاء
              </button>
            </div>
          </FormPanel>

          {faqs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              لا توجد أسئلة — أضف أول سؤال
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
                        <FaEdit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentManager;
