import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  MdPayments,
  MdGavel,
  MdMedicalServices,
  MdComputer,
  MdEngineering,
  MdPalette,
  MdRecordVoiceOver,
} from "react-icons/md";
import { GrLinkPrevious } from "react-icons/gr";
import { GiMicroscope } from "react-icons/gi";
import { getColleges } from "@/api/colleges";

interface CollegeItem {
  id: string;
  name: string;
  category: string;
}

/** دالة مطابقة الأيقونة حسب التخصص / القسم أو اسم الكلية */
const getIconByCategory = (category: string = "", name: string = "") => {
  const text = `${category} ${name}`.toLowerCase();
  if (text.includes("طب") || text.includes("صحة") || text.includes("صيدلة") || text.includes("تمريض") || text.includes("أسنان")) {
    return <MdMedicalServices size={32} />;
  }
  if (text.includes("هندسة")) {
    return <MdEngineering size={32} />;
  }
  if (text.includes("حاسوب") || text.includes("حاسبات") || text.includes("تقنية") || text.includes("برمجة") || text.includes("معلومات") || text.includes("ذكاء")) {
    return <MdComputer size={32} />;
  }
  if (text.includes("اقتصاد") || text.includes("أعمال") || text.includes("إدارة") || text.includes("تجارة") || text.includes("مال")) {
    return <MdPayments size={32} />;
  }
  if (text.includes("حقوق") || text.includes("قانون") || text.includes("شريعة")) {
    return <MdGavel size={32} />;
  }
  if (text.includes("تربية") || text.includes("آداب") || text.includes("لغات") || text.includes("إنسان")) {
    return <MdRecordVoiceOver size={32} />;
  }
  if (text.includes("فن") || text.includes("تصميم") || text.includes("عمارة") || text.includes("إعلام")) {
    return <MdPalette size={32} />;
  }
  if (text.includes("علوم") || text.includes("طبيعة") || text.includes("كيمياء") || text.includes("فيزياء") || text.includes("أحياء")) {
    return <GiMicroscope size={32} />;
  }
  return <MdComputer size={32} />;
};

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const headerPop = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      scale: { type: "spring", visualDuration: 0.4, bounce: 0.2 },
    },
  },
};

const cardPop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      type: "spring",
      bounce: 0.4,
    },
  },
};

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    setLoading(true);
    getColleges()
      .then((res) => {
        const items =
          res?.data?.items ||
          res?.items ||
          res?.data ||
          (Array.isArray(res) ? res : []);
        setColleges(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.error("فشل جلب الكليات:", err);
        setColleges([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-20 bg-bgSection">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          variants={headerPop}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="text-center mb-10"
        >
          <h2 className="font-bold text-3xl md:text-4xl mb-4 text-primary">
            استكشف حسب المجال
          </h2>
          <p className="text-gray-500 text-lg">
            اختر مجالك المفضل وابدأ رحلتك التعليمية معنا
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="flex justify-end mb-6"
        >
          <Link
            to="/colleges"
            className="font-bold text-primary hover:text-accent text-lg no-underline flex items-center gap-2 transition-colors w-fit group"
          >
            عرض جميع المجالات{" "}
            <GrLinkPrevious className="group-hover:-translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        {/* Cards Content */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="p-6 text-center shadow-sm h-36 rounded-2xl bg-white border border-gray-100 animate-pulse flex flex-col items-center justify-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm">
            لا توجد كليات مضافة حالياً. يمكنك إضافتها من لوحة التحكم.
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {colleges.map((college) => (
              <motion.div variants={cardPop} key={college.id}>
                <div
                  onClick={() => navigate(`/colleges/${college.id}`)}
                  className="p-6 text-center shadow-sm h-full rounded-2xl bg-card border border-gray-200 hover:border-primary cursor-pointer hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center"
                >
                  <div className="flex items-center justify-center mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 text-accent">
                    {getIconByCategory(college.category, college.name)}
                  </div>
                  <div className="font-semibold text-primary text-lg">
                    {college.name}
                  </div>
                 
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div> 
    </section>
  );
};

export default Categories;
