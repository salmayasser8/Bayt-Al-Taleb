import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { GrLinkPrevious } from "react-icons/gr";
import { FaChevronDown } from "react-icons/fa";
import { FaHospitalAlt, FaUserNurse, FaGraduationCap } from "react-icons/fa";
import { FaClinicMedical } from "react-icons/fa";
import { IoIosGitCompare } from "react-icons/io";
import SideBar from "../components/common/SideBar";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { GiGraduateCap } from "react-icons/gi";
import { IoBagOutline } from "react-icons/io5";
import { CiMoneyBill } from "react-icons/ci";
import { CiGift } from "react-icons/ci";
import { GiAlliedStar } from "react-icons/gi";
import { FaQuestion } from "react-icons/fa";
import Button from "../components/common/Button";
import { GiHumanPyramid } from "react-icons/gi";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { MdPsychology } from "react-icons/md";
// ── Types ─────────────────────────────────────────────────────────────

interface University {
  name: string;
  location: string;
  admissionLink: string;
}

interface JobField {
  icon: React.ReactNode;
  label: string;
}

interface SalaryRange {
  level: string;
  range: string;
  note: string;
}

interface FAQItem {
  icon: React.ReactNode;
  question: string;
  answer: string;
}

interface MajorData {
  name: string;
  degree: string;
  college: string;
  collegeId: string;
  description: string;
  overview: string;
  universities: University[];
  jobFields: JobField[];
  salaries: SalaryRange[];
  scholarshipsNote: string;
  degreeTitle: string;
  degreeSpecializations: string[];
  faqs: FAQItem[];
}

// ── Data ──────────────────────────────────────────────────────────────
// TODO: replace with real API call → fetch(`/api/majors/${id}`)

const majorData: MajorData = {
  name: "التمريض",
  degree: "BSN",
  college: "الطب والصحة",
  collegeId: "medicine",
  description:
    "يُعد تخصص التمريض أحد أهم الأركان الأساسية في المنظومة الصحية، وهو مزيج فريد بين العلم والرحمة، يهدف إلى تقديم الرعاية الشاملة للمرضى وتعزيز الصحة في المجتمع.",
  overview:
    "مهنة التمريض هي علم وفن يهتم بالفرد ككل - جسماً وعقلاً وروحاً. يعمل الممرضون والممرضات كحلقة وصل أساسية بين المريض والفريق الطبي، حيث يقدمون الرعاية المباشرة، ويراقبون الحالة الصحية، ويقدمون الدعم النفسي والتعليمي للمرضى وعائلاتهم. يعتمد تخصص التمريض على دراسة العلوم الطبية الأساسية مثل التشريح، والفيزيولوجيا، وعلم الأدوية، بالإضافة إلى المهارات السريرية المتقدمة وأخلاقيات المهنة.",
  universities: [
    {
      name: "جامعة النجاح الوطنية",
      location: "نابلس، فلسطين",
      admissionLink: "#",
    },
    { name: "جامعة بيرزيت", location: "بيرزيت، رام الله", admissionLink: "#" },
    {
      name: "الجامعة العربية الأمريكية",
      location: "جنين / رام الله",
      admissionLink: "#",
    },
    {
      name: "جامعة القدس (أبو ديس)",
      location: "القدس، فلسطين",
      admissionLink: "#",
    },
  ],
  jobFields: [
    { icon: <FaHospitalAlt />, label: "المستشفيات العامة والخاصة" },
    { icon: <FaClinicMedical />, label: "العيادات والمراكز الصحية" },
    { icon: <FaUserNurse />, label: "التمريض المنزلي" },
    { icon: <IoIosGitCompare />, label: "مراكز إعادة التأهيل" },
    { icon: <FaGraduationCap />, label: "الصحة المدرسية والجامعية" },
  ],
  salaries: [
    {
      level: "حديثو التخرج",
      range: "₪4,500 - ₪6,000",
      note: "تعتمد على المؤسسة والورديات الليلية",
    },
    {
      level: "ممرض مختص / خبير",
      range: "₪7,500 - ₪12,000+",
      note: "تعتمد على التخصص الدقيق والدرجة العلمية",
    },
  ],
  scholarshipsNote:
    "تتوفر العديد من المنح المحلية والدولية لطلاب التمريض المتفوقين لدعم مسيرتهم الأكاديمية.",
  degreeTitle: "بكالوريوس في علوم التمريض (BSN)",
  degreeSpecializations: [
    "تمريض العناية المكثفة",
    "تمريض القبالة القانونية",
    "إدارة التمريض",
    "تمريض الصحة النفسية",
  ],
  faqs: [
    {
      icon: <MdOutlineTipsAndUpdates size={20} />,
      question: "نصائح متقدمة للطلاب",
      answer:
        "ركز على المهارات العملية (Lab) منذ السنة الأولى. التمريض مهنة تعتمد على الممارسة بقدر ما تعتمد على النظرية. ابدأ ببناء شبكة علاقات مهنية خلال فترات التدريب العملي في المستشفيات.",
    },
    {
      icon: <MdPsychology size={20} />,
      question: "رأي المختصين",
      answer:
        "ينصح الخبراء بضرورة التحلي بالصبر والقدرة على ضبط النفس، فالعمل في التمريض يتطلب قوة ذهنية وجسدية كبيرة لمواجهة الحالات الطارئة.",
    },
    {
      icon: <FaQuestion size={20} />,
      question: "هل دراسة التمريض صعبة؟",
      answer:
        "الدراسة ممتعة لمن يحب المجال الطبي، لكنها تتطلب التزاماً عالياً في المحاضرات والتدريب السريري.",
    },
    {
      icon: <GiHumanPyramid size={20} />,
      question: "هل التخصص متاح للذكور والإناث؟",
      answer:
        "نعم، التمريض تخصص متاح ومطلوب جداً لكلا الجنسين في كافة المؤسسات الصحية.",
    },
  ],
};

// ── Sidebar nav items ─────────────────────────────────────────────────

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
  { id: "scholarships", label: "المنح", icon: <CiGift size={25} /> },
  { id: "degrees", label: "الألقاب", icon: <GiAlliedStar size={25} /> },
  { id: "tips", label: "نصائح وأسئلة", icon: <FaQuestion size={25} /> },
];

// ── Animation variants ────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

// ── FAQ Accordion ─────────────────────────────────────────────────────

const FAQItem: React.FC<{ item: FAQItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-right font-bold text-primary hover:bg-bgSection transition-colors"
      >
        <span className="flex items-center gap-2">
          {item.icon} {item.question}
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

// ── Main Page ─────────────────────────────────────────────────────────

const MajorDetailPage: React.FC = () => {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState("overview");

  // Refs for each section so we can scroll to them and detect which is active
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // ScrollSpy — detect which section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120; // offset for sticky nav

      for (const item of navItems) {
        const el = sectionRefs.current[item.id];
        if (el) {
          const { offsetTop, offsetHeight } = el;
          if (scrollY >= offsetTop && scrollY < offsetTop + offsetHeight) {
            setActiveSection(item.id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to section on sidebar click
  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.offsetTop - 100; // offset for sticky nav
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

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
          <Link
            to={`/colleges/${majorData.collegeId}`}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            {majorData.college}
          </Link>
          <IoChevronBack className="text-gray-400" />
          <span className="text-primary">{majorData.name}</span>
        </motion.div>

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <h1 className="font-bold text-3xl md:text-4xl text-primary mb-3">
            تخصص {majorData.name} ({majorData.degree})
          </h1>
          <p className="text-gray-500 font-semibold text-lg max-w-2xl">
            {majorData.description}
          </p>
        </motion.div>

        {/* Content: sections + sticky sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Sections — left side (col-span-2) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Overview */}
            <motion.section
              ref={(el) =>
                (sectionRefs.current["overview"] = el as HTMLElement)
              }
              id="overview"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="font-bold text-xl text-primary mb-4">
                شرح عام عن التخصص
              </h2>
              <p className="text-gray-500 leading-relaxed">
                {majorData.overview}
              </p>
            </motion.section>

            {/* Universities */}
            <motion.section
              ref={(el) =>
                (sectionRefs.current["universities"] = el as HTMLElement)
              }
              id="universities"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="font-bold text-2xl text-primary mb-4">
                أماكن التعليم في فلسطين
              </h2>
              <div className="flex flex-col gap-3">
                {majorData.universities.map((uni, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:bg-bgSection transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-primary">{uni.name}</h4>
                      <p className="text-gray-500 text-sm mt-1">
                        {uni.location}
                      </p>
                    </div>
                    <Link
                      to={uni.admissionLink}
                      className="flex items-center gap-1 text-primary font-semibold no-underline hover:text-accent transition-colors text-sm"
                    >
                      شروط القبول <GrLinkPrevious />
                    </Link>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Jobs */}
            <motion.section
              ref={(el) => (sectionRefs.current["jobs"] = el as HTMLElement)}
              id="jobs"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="font-bold text-2xl text-primary mb-4">
                مجالات سوق العمل
              </h2>
              <div className="flex flex-col gap-3">
                {majorData.jobFields.map((field, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border border-gray-100 rounded-xl p-4"
                  >
                    <span className="text-2xl text-accent">{field.icon}</span>
                    <span className="font-semibold text-primary">
                      {field.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Salaries */}
            <motion.section
              ref={(el) =>
                (sectionRefs.current["salaries"] = el as HTMLElement)
              }
              id="salaries"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="font-bold text-2xl text-primary mb-4">
                نطاق الرواتب المتوقع
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {majorData.salaries.map((salary, i) => (
                  <div
                    key={i}
                    className="bg-bgSection rounded-xl p-5 text-center"
                  >
                    <h4 className="font-bold text-primary mb-2">
                      {salary.level}
                    </h4>
                    <div className="font-bold text-2xl text-accent mb-2">
                      {salary.range}
                    </div>
                    <p className="text-gray-500 text-sm">{salary.note}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Scholarships */}
            <motion.section
              ref={(el) =>
                (sectionRefs.current["scholarships"] = el as HTMLElement)
              }
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
              <p className="text-gray-500 mb-4">{majorData.scholarshipsNote}</p>
              <Link to="/scholarships" className="w-fit">
                <Button> تصفح قائمة المنح </Button>
              </Link>
            </motion.section>

            {/* Degrees */}
            <motion.section
              ref={(el) => (sectionRefs.current["degrees"] = el as HTMLElement)}
              id="degrees"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="font-bold text-2xl text-primary mb-4">
                الألقاب والدرجات العلمية
              </h2>
              <p className="text-gray-500 mb-4">
                عند التخرج يحصل الطالب على{" "}
                <span className="font-bold text-primary">
                  {majorData.degreeTitle}
                </span>
                . تفتح هذه الدرجة الباب للتخصص في:
              </p>
              <ul className="flex flex-col gap-2">
                {majorData.degreeSpecializations.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    {spec}
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Tips & FAQ */}
            <motion.section
              ref={(el) => (sectionRefs.current["tips"] = el as HTMLElement)}
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
                {majorData.faqs.map((faq, i) => (
                  <FAQItem key={i} item={faq} />
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

export default MajorDetailPage;
