import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import SideBar from "../components/common/SideBar";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { GiGraduateCap } from "react-icons/gi";
import { IoBagOutline } from "react-icons/io5";
import { CiMoneyBill } from "react-icons/ci";
import { CiGift } from "react-icons/ci";
import { GiAlliedStar } from "react-icons/gi";
import Button from "../components/common/Button";
import { MdError } from "react-icons/md";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getMajorById } from "../api/majors.js";
import { getMajorSections } from "../api/majors.js";
import { getMajorFaqs } from "../api/majors.js";
import OverviewSection from "../components/sections/MajorDetailPage/OverviewSection";
import DegreesSection from "../components/sections/MajorDetailPage/DegreesSection";
import UniversitiesSection from "../components/sections/MajorDetailPage/UniversitiesSection";
import JobSection from "../components/sections/MajorDetailPage/JobSection";
import SalariesSection from "../components/sections/MajorDetailPage/SalariesSection";
import { FaQuestion } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
// ── Types ────────────────────────────────────────────────────────
interface MajorView {
  id: string;
  slug: string;
  name: string;
  degree?: string | null;
  collegeId?: string | null;
  college?: { id: string; slug: string; name: string } | null;
}
interface SectionView {
  id: string;
  title: string;
  content: string;
}
interface FaqView {
  id: string;
  question: string;
  answer: string;
}
// ── Sidebar Nav ──────────────────────────────────────────────────
const navItems = [
  {
    id: "overview",
    label: "شرح عام",
    icon: <IoIosInformationCircleOutline size={25} />,
  },
  {
    id: "universities",
    label: "أماكن التعليم",
    icon: <GiGraduateCap size={25} />,
  },
  { id: "jobs", label: "سوق العمل", icon: <IoBagOutline size={25} /> },
  { id: "salaries", label: "الرواتب", icon: <CiMoneyBill size={25} /> },
  { id: "degrees", label: "الألقاب", icon: <GiAlliedStar size={25} /> },
  { id: "scholarships", label: "المنح", icon: <CiGift size={25} /> },
  { id: "tips", label: "نصائح وأسئلة", icon: <FaQuestion size={25} /> },
];

// ── Animations ───────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

// ── FAQ Accordion ────────────────────────────────────────────────
const FAQItem: React.FC<{ item: FaqView }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-right font-bold text-primary hover:bg-bgSection transition-colors"
      >
        <span className="flex items-center gap-2">
          <FaQuestion size={18} className="text-accent" /> {item.question}
        </span>
        <FaChevronDown
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="px-6 py-4 text-gray-500 border-t border-gray-100">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────
const MajorDetailPage: React.FC = () => {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState("overview");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const [major, setMajor] = useState<MajorView | null>(null);
  const [sections, setSections] = useState<SectionView[]>([]);
  const [faqs, setFaqs] = useState<FaqView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch Data ────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getMajorById(id), getMajorSections(id), getMajorFaqs(id)])
      .then(([majorRes, secRes, faqRes]) => {
        setMajor(majorRes.data || majorRes);
        setSections(
          Array.isArray(secRes.data) ? secRes.data : secRes.data?.items || [],
        );
        setFaqs(
          Array.isArray(faqRes.data) ? faqRes.data : faqRes.data?.items || [],
        );
      })
      .catch(() => setError("فشل في تحميل بيانات التخصص"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Scroll Spy ───────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      for (const item of navItems) {
        const el = sectionRefs.current[item.id];
        if (
          el &&
          scrollY >= el.offsetTop &&
          scrollY < el.offsetTop + el.offsetHeight
        )
          setActiveSection(item.id);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
  };

  // ── Dynamic Section Renderer ─────────────────────────────────
  const renderSection = (section: SectionView) => {
    // Safe JSON parser
    let parsedData: any;
    try {
      parsedData = JSON.parse(section.content);
    } catch {
      parsedData = null;
    }

    switch (section.title) {
      case "شرح عام":
        return (
          <OverviewSection
            key={section.id}
            content={section.content}
            sectionRef={(el) => (sectionRefs.current["overview"] = el)}
          />
        );

      case "universities":
        return (
          <UniversitiesSection
            key={section.id}
            content={section.content}
            sectionRef={(el) => (sectionRefs.current["universities"] = el)}
          />
        );

      case "jobs":
        return (
          <JobSection
            key={section.id}
            content={section.content}
            sectionRef={(el) => (sectionRefs.current["jobs"] = el)}
          />
        );

      case "salaries":
        return (
          <SalariesSection
            key={section.id}
            content={section.content}
            sectionRef={(el) => (sectionRefs.current["salaries"] = el)}
          />
        );

      case "degrees":
        return (
          <DegreesSection
            key={section.id}
            degree={major?.degree}
            content={section.content}
            sectionRef={(el: any) => (sectionRefs.current["degrees"] = el)}
          />
        );

      default:
        return null; // Ignore unknown sections
    }
  };

  // ── States ───────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-bgSection flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل التخصص..." />
      </div>
    );
  if (error || !major)
    return (
      <div className="min-h-screen bg-bgSection flex flex-col items-center justify-center gap-4">
        <MdError size={50} className="text-primary" />
        <p className="text-gray-500 text-lg font-medium">
          {error || "التخصص غير موجود"}
        </p>
        <Link to="/colleges">
          <Button>العودة لقائمة الكليات</Button>
        </Link>
      </div>
    );

  // ── Main UI ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bgSection">
      <div className="container py-8">
        {/* Breadcrumb */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-2 text-sm font-semibold mb-6 flex-wrap"
        >
          <Link
            to="/"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            الرئيسية
          </Link>
          <IoChevronBack className="text-gray-400" />
          <Link
            to="/colleges"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            الكليات
          </Link>
          <IoChevronBack className="text-gray-400" />
          {major.college && (
            <>
              <Link
                to={`/colleges/${major.college.slug || major.college.id}`}
                className="text-gray-400 hover:text-primary transition-colors"
              >
                {major.college.name}
              </Link>
              <IoChevronBack className="text-gray-400" />
            </>
          )}
          <span className="text-primary">{major.name}</span>
        </motion.div>

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <h1 className="font-bold text-3xl md:text-4xl text-primary mb-3">
            تخصص {major.name} {major.degree ? `(${major.degree})` : ""}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Render Dynamic Sections from Postman */}
            {sections.map((section) => renderSection(section))}

            {/* Static Scholarships Section (Always the same) */}
            <motion.section
              ref={(el) => (sectionRefs.current["scholarships"] = el)}
              id="scholarships"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="bg-white text-center rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="font-bold text-2xl text-primary mb-4">
                فرص المنح الدراسية
              </h2>
              <p className="text-gray-500 mb-4">
                تتوفر العديد من المنح المحلية والدولية لطلاب هذا التخصص
                المتفوقين.
              </p>
              <Link to="/scholarships" className="w-fit mx-auto">
                <Button> تصفح قائمة المنح </Button>
              </Link>
            </motion.section>

            {/* Dynamic FAQs from Postman */}
            <motion.section
              ref={(el) => (sectionRefs.current["tips"] = el)}
              id="tips"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="font-bold text-2xl text-primary mb-4">
                نصائح وأسئلة شائعة
              </h2>
              <div className="flex flex-col gap-3">
                {faqs.length > 0 ? (
                  faqs.map((faq) => <FAQItem key={faq.id} item={faq} />)
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    لا توجد أسئلة شائعة مضافة بعد.
                  </p>
                )}
              </div>
            </motion.section>
            {/* Dynamic FAQs from Postman */}
            {/* <TipsSection
              sections={sections}
              faqs={faqs}
              sectionRef={(el) => (sectionRefs.current["tips"] = el)}
            /> */}
          </div>

          <SideBar
            items={navItems}
            activeSection={activeSection}
            onItemClick={scrollToSection}
          />
        </div>
      </div>
    </div>
  );
};

export default MajorDetailPage;
