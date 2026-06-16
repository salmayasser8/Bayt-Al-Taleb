import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { MdMedicalServices } from "react-icons/md";
import Button from "@/components/common/Button";
// import AdvisorModal from "@/components/common/AdvisorModal";

// ── Types ────────────────────────────────────────────────────────────

interface Major {
  name: string;
  degree: string;
}

interface CollegeData {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  majors: Major[];
  stats: {
    majorsCount: number;
    studentsCount: string;
    foundedYear: number;
  };
}

// ── Data ─────────────────────────────────────────────────────────────
//will be replaced

const collegeData: CollegeData = {
  id: "medicine",
  name: "الطب والصحة",
  icon: <MdMedicalServices size={40} />,
  description:
    "استكشف قائمة التخصصات الأكاديمية المتاحة في مجال الطب والعلوم الصحية، مع توضيح الألقاب العلمية الممنوحة لكل تخصص.",
  majors: [
    { name: "الطب العام", degree: "MD" },
    { name: "التمريض", degree: "BSN" },
    { name: "العلاج الطبيعي", degree: "BPT" },
    { name: "علوم المختبرات الطبية", degree: "B.Med.Lab.Sc" },
    { name: "التصوير الطبي", degree: "B.Med.Imaging" },
    { name: "علاج النطق والسمع", degree: "BA" },
    { name: "الصيدلة", degree: "B.Pharm" },
    { name: "العلاج الوظيفي", degree: "BOT" },
    { name: "طب الأسنان", degree: "DMD" },
  ],
  stats: {
    majorsCount: 9,
    studentsCount: "+2,500",
    foundedYear: 1998,
  },
};

// ── Animation variants ───────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const rowFade: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const CollegeDetailPage: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-bgSection">
      <div className="container py-8">
        {/* Breadcrumb */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-2 text-sm font-semibold mb-6"
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
          <span className="text-primary">{collegeData.name}</span>
        </motion.div>

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <h1 className="font-bold text-3xl md:text-4xl text-primary mb-3">
            كليات {collegeData.name}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {collegeData.description}
          </p>
        </motion.div>

        {/* Content: table + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Majors table */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <table className="w-full text-right">
              <thead className="bg-primary/5 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-lg text-primary">
                    التخصص
                  </th>
                  <th className="px-6 py-4 font-bold text-lg text-primary">
                    اللقب الأكاديمي
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={container}
                initial="hidden"
                animate="visible"
              >
                {collegeData.majors.map((major, i) => (
                  <motion.tr
                    key={major.name}
                    variants={rowFade}
                    className={`border-b border-gray-100 hover:bg-bgSection transition-colors ${
                      i === collegeData.majors.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/majors/${major.name}`}
                        className="text-primary font-semibold no-underline hover:text-accent transition-colors"
                      >
                        {major.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {major.degree}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            {/* Advisor card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-accent/80 mx-auto mb-4">
                {collegeData.icon}
              </div>
              <h3 className="font-bold text-lg text-primary mb-2">
                هل تحتاج لمساعدة؟
              </h3>
              <p className="text-gray-500 text-sm mb-4 font-semibold">
                يمكنك التواصل مع مستشارينا الأكاديميين للحصول على معلومات أكثر
                تفصيلاً حول التخصصات وشروط القبول.
              </p>
              <motion.a
                href="tel:+201234567890"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className=" w-full "
              >
                <Button className=" w-full "> تحدث مع مستشار</Button>
              </motion.a>
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-primary mb-4">
                إحصائيات الكلية
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-semibold">
                    عدد التخصصات
                  </span>
                  <span className="font-bold text-primary">
                    {collegeData.stats.majorsCount} تخصصات
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-semibold">
                    الطلاب المسجلين
                  </span>
                  <span className="font-bold text-primary">
                    {collegeData.stats.studentsCount} طالب
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-semibold">
                    سنة التأسيس
                  </span>
                  <span className="font-bold text-primary">
                    {collegeData.stats.foundedYear}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Advisor Modal */}
      {/* <AdvisorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> */}
    </div>
  );
};

export default CollegeDetailPage;
