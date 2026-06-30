import React from "react";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

interface Props {
  content: string;
  degree?: string | null;
  sectionRef: (el: HTMLElement | null) => void;
}

const DegreesSection: React.FC<Props> = ({ content, degree, sectionRef }) => {
  let specializations: string[] = [];
  try {
    const parsed = JSON.parse(content);
    specializations = Array.isArray(parsed) ? parsed : [];
  } catch {
    specializations = [];
  }

  return (
    <motion.section
      ref={sectionRef}
      id="degrees"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <h2 className="font-bold text-xl text-primary mb-4">
        الألقاب والدرجات العلمية
      </h2>
      <p className="text-gray-500 mb-4">
        عند التخرج يحصل الطالب على{" "}
        <span className="font-bold text-primary">{degree || "درجة علمية"}</span>
        . تفتح هذه الدرجة الباب للتخصص في:
      </p>
      <ul className="flex flex-col gap-2">
        {specializations.map((spec, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-500">
            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
            {spec}
          </li>
        ))}
      </ul>
    </motion.section>
  );
};

export default DegreesSection;
