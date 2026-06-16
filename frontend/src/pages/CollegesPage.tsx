import React, { useState, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MdPayments,
  MdGavel,
  MdMedicalServices,
  MdComputer,
  MdEngineering,
  MdPalette,
  MdRecordVoiceOver,
  MdTrendingUp,
} from "react-icons/md";
import { GiMicroscope } from "react-icons/gi";
import { GrLinkPrevious } from "react-icons/gr";
import SearchBar from "@/components/common/SerachBar";

// ── Types ────────────────────────────────────────────────────────────

interface College {
  id: number;
  icon: React.ReactNode;
  name: string;
  category: string;
  desc: string;
}

//will be replaced with data from backend
const colleges: College[] = [
  {
    id: 1,
    icon: <MdPayments size={32} />,
    name: "اقتصاد وإدارة الأعمال",
    category: "أعمال",
    desc: "استكشف تخصصات هذا المجال",
  },
  {
    id: 2,
    icon: <MdGavel size={32} />,
    name: "الحقوق",
    category: "قانون",
    desc: "استكشف تخصصات هذا المجال",
  },
  {
    id: 3,
    icon: <MdRecordVoiceOver size={32} />,
    name: "التربية",
    category: "تربية",
    desc: "استكشف تخصصات هذا المجال",
  },
  {
    id: 4,
    icon: <MdMedicalServices size={32} />,
    name: "الطب والصحة",
    category: "طب",
    desc: "استكشف تخصصات هذا المجال",
  },
  {
    id: 5,
    icon: <MdComputer size={32} />,
    name: "علوم الحاسوب",
    category: "تقنية",
    desc: "استكشف تخصصات هذا المجال",
  },
  {
    id: 6,
    icon: <MdPalette size={32} />,
    name: "الفنون والتصميم",
    category: "فنون",
    desc: "استكشف تخصصات هذا المجال",
  },
  {
    id: 7,
    icon: <MdEngineering size={32} />,
    name: "الهندسة",
    category: "هندسة",
    desc: "استكشف تخصصات هذا المجال",
  },
  {
    id: 8,
    icon: <GiMicroscope size={32} />,
    name: "العلوم الطبيعية",
    category: "علوم",
    desc: "استكشف تخصصات هذا المجال",
  },
  {
    id: 9,
    icon: <MdTrendingUp size={32} />,
    name: "الاقتصاد",
    category: "أعمال",
    desc: "استكشف تخصصات هذا المجال",
  },
];

const filterTabs = [
  "الكل",
  "طب",
  "هندسة",
  "تقنية",
  "أعمال",
  "قانون",
  "علوم",
  "فنون",
  "تربية",
];

// ── Animation variants ────────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardPop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      type: "spring",
      bounce: 0.4,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── College Card ──────────────────────────────────────────────────────

const CollegeCard: React.FC<{ college: College }> = ({ college }) => (
  <motion.div
    variants={cardPop}
    whileHover={{ y: -6 }}
    transition={{ duration: 0.2 }}
  >
    <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-primary shadow-sm transition-colors h-full flex flex-col gap-4">
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-accent">
        {college.icon}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-xl text-primary">{college.name}</h3>
        <p className="text-gray-500 font-medium">{college.desc}</p>
      </div>

      {/* Link */}
      <Link
        to={`/colleges/${college.id}`}
        className="flex items-center gap-2 text-primary font-bold no-underline hover:text-accent transition-colors w-fit group"
      >
        عرض التفاصيل
        <GrLinkPrevious className="group-hover:-translate-x-1 transition-transform" />
      </Link>
    </div>
  </motion.div>
);

const CollegesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");

  // Filter logic — runs only when searchQuery or activeFilter changes
  const filteredColleges = useMemo(() => {
    return colleges.filter((college) => {
      const matchesSearch = college.name.includes(searchQuery);
      const matchesFilter =
        activeFilter === "الكل" || college.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  return (
    <div className="container min-h-screen bg-bgSection">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="py-12 px-6 text-center md:text-start "
      >
        <h1 className="font-bold text-4xl text-primary mb-3">
          جميع الاختصاصات الأكاديمية
        </h1>
        <p className="text-gray-500 text-lg max-w-xl ">
          اكتشف مستقبلك الدراسي من خلال استعراض الكليات المتاحة واختيار التخصص
          الذي يناسب طموحاتك
        </p>
      </motion.div>
      <div className="container py-10  ">
        {/* Search + Filter */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 mb-8"
        >
          {/* Search bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* will be replaced with real data`from backend*/}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors bg-white text-primary"
            >
              <option value="الكل">جميع الكليات</option>
              <option value="طب">كلية الطب</option>
              <option value="هندسة">كلية الهندسة</option>
              <option value="تقنية">علوم الحاسوب</option>
              <option value="أعمال">الأعمال</option>
              <option value="قانون">الحقوق</option>
              <option value="علوم">العلوم الطبيعية</option>
              <option value="فنون">الفنون والتصميم</option>
              <option value="تربية">التربية</option>
            </select>
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="ابحث عن كلية..."
              />
            </div>
          </div>
        </motion.div>

        {/* Colleges grid */}
        {filteredColleges.length > 0 ? (
          <motion.div
            key={activeFilter}
            variants={container}
            initial="hidden"
            animate="visible"
            viewport={{ once: false, amount: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 "
          >
            {filteredColleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </motion.div>
        ) : (
          // Empty state
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-bold text-xl text-primary mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-500">
              حاول البحث بكلمة مختلفة أو اختر فلتر آخر
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CollegesPage;
