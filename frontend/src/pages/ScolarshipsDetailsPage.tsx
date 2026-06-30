import React, { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { GrLinkPrevious } from "react-icons/gr";
import { FaCheckCircle, FaEnvelope, FaPhone, FaGlobe } from "react-icons/fa";
import {
  MdDescription,
  MdPayments,
  MdVolunteerActivism,
  MdRule,
  MdHowToReg,
  MdTipsAndUpdates,
  MdContactSupport,
} from "react-icons/md";
import { MdError } from "react-icons/md";
import SideBar from "@/components/common/SideBar";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getScholarshipById, getScholarshipSections } from "@/api/scholarships";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { FaFileAlt } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import img from "../assets/images/scholarship.png";
import { GiGraduateCap } from "react-icons/gi";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
// ── Types ─────────────────────────────────────────────────────────────

interface ScholarshipView {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface SectionView {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
}
// ── Sidebar nav items ─────────────────────────────────────────────────

const navItems = [
  { id: "overview", label: "شرح عام", icon: <MdDescription size={25} /> },
  { id: "value", label: "قيمة المنحة", icon: <MdPayments size={25} /> },
  {
    id: "volunteering",
    label: "ساعات التطوع",
    icon: <MdVolunteerActivism size={25} />,
  },
  { id: "conditions", label: "شروط القبول", icon: <MdRule size={25} /> },
  {
    id: "registration",
    label: "طريقة التسجيل",
    icon: <MdHowToReg size={25} />,
  },
  { id: "contact", label: "جهات اتصال", icon: <MdContactSupport size={25} /> },
  { id: "tips", label: "نصائح", icon: <MdTipsAndUpdates size={25} /> },
];

// Fixed tips — same for all scholarships
const FIXED_TIPS = [
  {
    icon: <BsFillLightningChargeFill size={25} />,
    text: "قدم طلبك مبكراً لتجنب الضغط الفني على الموقع في الأيام الأخيرة.",
  },
  {
    icon: <FaFileAlt size={25} />,
    text: "تأكد أن جميع الوثائق المرفوعة واضحة وبصيغة PDF عالية الجودة.",
  },
  {
    icon: <FaEdit size={25} />,
    text: "اكتب وصفاً دقيقاً في خانة الوضع الاجتماعي لتوضيح مدى حاجتك للمنحة.",
  },
  {
    icon: <FaBell size={25} />,
    text: "تابع بريدك الإلكتروني بانتظام لاستقبال أي طلبات استكمال للبيانات.",
  },
];

// ── Animation variants ────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const sectionStyle =
  "bg-white rounded-2xl border border-gray-200 p-6 shadow-sm";

// ── Section Renderers ─────────────────────────────────────────────────

const renderSection = (
  section: SectionView,
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>,
  registrationLink?: string,
) => {
  let parsed: any = null;
  try {
    parsed = JSON.parse(section.content);
  } catch {
    parsed = null;
  }

  switch (section.title) {
    case "شرح عام":
      return (
        <motion.section
          key={section.id}
          ref={(el) => {
            sectionRefs.current["overview"] = el;
          }}
          id="overview"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className={sectionStyle}
        >
          <h2 className="font-bold text-xl text-primary mb-4 flex items-center gap-2">
            <MdDescription className="text-accent" /> شرح عام
          </h2>
          <p className="text-gray-500 leading-relaxed">{section.content}</p>
        </motion.section>
      );

    case "قيمة المنحة":
      return (
        <motion.section
          key={section.id}
          ref={(el) => {
            sectionRefs.current["value"] = el;
          }}
          id="value"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className={sectionStyle}
        >
          <h2 className="font-bold text-xl text-primary mb-4 flex items-center gap-2">
            <MdPayments className="text-accent" /> قيمة المنحة
          </h2>
          <div className="bg-bgSection rounded-xl p-6 text-center">
            <div className="font-bold text-2xl text-accent mb-2">
              {section.content.split("\n")[0]}
            </div>
            <p className="text-gray-500 text-sm">
              {section.content.split("\n")[1]}
            </p>
            <p className="text-gray-500 text-md mt-2">
              تحدد القيمة بناءً على الوضع الاقتصادي والمعدل التراكمي.
            </p>
          </div>
        </motion.section>
      );

    case "ساعات التطوع":
      return (
        <motion.section
          key={section.id}
          ref={(el) => {
            sectionRefs.current["volunteering"] = el;
          }}
          id="volunteering"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className={sectionStyle}
        >
          <h2 className="font-bold text-xl text-primary mb-4 flex items-center gap-2">
            <MdVolunteerActivism className="text-accent" /> ساعات التطوع
          </h2>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-600 mb-3">
            بدون تطوع
          </span>
          <p className="text-gray-500">{section.content}</p>
        </motion.section>
      );

    case "شروط القبول":
      return (
        <motion.section
          key={section.id}
          ref={(el) => {
            sectionRefs.current["conditions"] = el;
          }}
          id="conditions"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className={sectionStyle}
        >
          <h2 className="font-bold text-xl text-primary mb-4 flex items-center gap-2">
            <MdRule className="text-accent" /> شروط القبول
          </h2>
          <div className="flex flex-col gap-4">
            {Array.isArray(parsed) ? (
              parsed.map((cond: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <FaCheckCircle
                    className="text-green-500 mt-1 flex-shrink-0"
                    size={18}
                  />
                  <div>
                    <h4 className="font-bold text-primary mb-1">
                      {cond.title}
                    </h4>
                    <p className="text-gray-500 text-sm">{cond.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">{section.content}</p>
            )}
          </div>
        </motion.section>
      );

    case "طريقة التسجيل":
      return (
        <motion.section
          key={section.id}
          ref={(el) => {
            sectionRefs.current["registration"] = el;
          }}
          id="registration"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className={sectionStyle}
        >
          <h2 className="font-bold text-xl text-primary mb-6 flex items-center gap-2">
            <MdHowToReg className="text-accent" /> طريقة التسجيل للمنحة
          </h2>
          <div className="flex flex-col gap-6">
            {Array.isArray(parsed) ? (
              parsed.map((step: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-accent flex items-center justify-center font-bold flex-shrink-0 text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">
                      {step.title}
                    </h4>
                    <p className="text-gray-500 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">{section.content}</p>
            )}
          </div>
          {registrationLink && (
            <div className="flex justify-center mt-6 items-center">
              <Link to={registrationLink}>
                <Button className="flex items-center justify-center gap-2 ">
                  رابط التسجيل
                  <GrLinkPrevious />
                </Button>
              </Link>
            </div>
          )}
        </motion.section>
      );

    case "جهات اتصال":
      return (
        <motion.section
          key={section.id}
          ref={(el) => {
            sectionRefs.current["contact"] = el;
          }}
          id="contact"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className={sectionStyle}
        >
          <h2 className="font-bold text-xl text-primary mb-4 flex items-center gap-2">
            <MdContactSupport className="text-accent" /> جهات اتصال
          </h2>
          <div className="flex flex-col gap-4 ">
            {parsed?.email && (
              <div className="flex items-center gap-3 text-gray-500">
                <FaEnvelope className="text-primary flex-shrink-0" size={18} />
                <a
                  href={`mailto:${parsed.email}`}
                  className="hover:text-primary transition-colors no-underline"
                >
                  {parsed.email}
                </a>
              </div>
            )}
            {parsed?.phone && (
              <div className="flex items-center gap-3 text-gray-500">
                <FaPhone className="text-primary flex-shrink-0" size={18} />
                <a
                  href={`tel:${parsed.phone}`}
                  className="hover:text-primary transition-colors no-underline"
                >
                  {parsed.phone}
                </a>
              </div>
            )}
            {parsed?.website && (
              <div className="flex items-center gap-3 text-gray-500">
                <FaGlobe className="text-primary flex-shrink-0" size={18} />
                <a
                  href={`https://${parsed.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors no-underline"
                >
                  {parsed.website}
                </a>
              </div>
            )}
            {parsed?.hours && (
              <p className="text-gray-400 text-sm mt-2 font-semibold">
                ساعات العمل: {parsed.hours}
              </p>
            )}
          </div>
          {parsed?.registrationLink && (
            <div className="flex justify-center mt-6 items-center">
              <Link
                to={parsed.registrationLink}
                className=" inline-flex items-center gap-2"
              >
                <Button className="flex items-center justify-center gap-2">
                  زيارة البوابة الرسمية
                  <GrLinkPrevious size={18} />
                </Button>
              </Link>
            </div>
          )}
        </motion.section>
      );

    default:
      return null;
  }
};

// ── Main Page ─────────────────────────────────────────────────────────

const ScholarshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeSection, setActiveSection] = useState("overview");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const [scholarship, setScholarship] = useState<ScholarshipView | null>(null);
  const [sections, setSections] = useState<SectionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getScholarshipById(id), getScholarshipSections(id)])
      .then(([scholarshipRes, secRes]) => {
        setScholarship(scholarshipRes.data || scholarshipRes);
        setSections(
          Array.isArray(secRes.data) ? secRes.data : secRes.data?.items || [],
        );
      })
      .catch(() => setError("فشل في تحميل بيانات المنحة"))
      .finally(() => setLoading(false));
  }, [id]);

  // ScrollSpy
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      for (const item of navItems) {
        const el = sectionRefs.current[item.id];
        if (
          el &&
          scrollY >= el.offsetTop &&
          scrollY < el.offsetTop + el.offsetHeight
        ) {
          setActiveSection(item.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
  };

  // Get registration link from جهات اتصال section
  const contactSection = sections.find((s) => s.title === "جهات اتصال");
  let registrationLink = "#";
  try {
    if (contactSection)
      registrationLink =
        JSON.parse(contactSection.content)?.registrationLink || "#";
  } catch {}

  if (loading)
    return (
      <div className="min-h-screen bg-bgSection flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل المنحة..." />
      </div>
    );

  if (error || !scholarship)
    return (
      <div className="min-h-screen bg-bgSection flex flex-col items-center justify-center gap-4">
        <MdError size={50} className="text-primary" />
        <p className="text-gray-500 text-lg font-medium">
          {error || "المنحة غير موجودة"}
        </p>
        <Link to="/scholarships">
          <Button>العودة لقائمة المنح</Button>
        </Link>
      </div>
    );

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
            to="/scholarships"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            المنح الأكاديمية
          </Link>
          <IoChevronBack className="text-gray-400" />
          <span className="text-primary">{scholarship.name}</span>
        </motion.div>

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                scholarship.isActive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-400"
              }`}
            >
              <FaCheckCircle size={14} />
              {scholarship.isActive ? "مفتوحة للتقديم" : "مغلقة"}
            </span>
          </div>

          <div className="relative w-full md:w-2/3 rounded-2xl overflow-hidden min-h-[250px] group ">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${img})` }}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 p-12 h-full flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-white mb-3">
                {scholarship.name}
              </h3>
              <div className="flex items-center justify- gap-6 mt-4">
                <span className="bg-white/30 rounded-full px-4 py-1 flex items-center gap-2">
                  <GiGraduateCap size={20} />
                  لطلبة الجامعات
                </span>
                <span className="bg-white/30 rounded-full px-4 py-1 flex items-center gap-2">
                  <IoCheckmarkDoneCircle size={20} />
                  معتمدة
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Dynamic sections from backend */}
            {sections
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((section) =>
                renderSection(section, sectionRefs, registrationLink),
              )}

            {/* Fixed tips section — same for all scholarships */}
            <motion.section
              ref={(el) => {
                sectionRefs.current["tips"] = el;
              }}
              id="tips"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              className={sectionStyle}
            >
              <h2 className="font-bold text-xl text-primary mb-4 flex items-center gap-2">
                <MdTipsAndUpdates className="text-accent" /> نصائح لضمان القبول
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FIXED_TIPS.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-bgSection rounded-xl p-4"
                  >
                    <span className=" text-accent">{tip.icon}</span>
                    <p className="text-gray-500 font-medium">{tip.text}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sticky Sidebar */}
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

export default ScholarshipDetailPage;
