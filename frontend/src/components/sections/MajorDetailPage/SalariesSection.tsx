import React from "react";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

interface SalaryItem {
  level: string;
  range: string;
  note: string;
}

interface Props {
  content: string;
  sectionRef: (el: HTMLElement | null) => void;
}

const SalariesSection: React.FC<Props> = ({ content, sectionRef }) => {
  let salaries: SalaryItem[] = [];
  try {
    salaries = JSON.parse(content);
  } catch {
    salaries = [];
  }

  return (
    <motion.section
      ref={sectionRef}
      id="salaries"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <h2 className="font-bold text-2xl text-primary mb-6">الرواتب</h2>
      {salaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {salaries.map((salary, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-gray-100 bg-gray-50 gap-8 "
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-gray-500">{salary.level}</h3>
                <span className="font-bold text-primary  text-2xl">
                  {salary.range}
                </span>
                <p className="text-sm text-gray-500">{salary.note}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">{content}</p>
      )}
    </motion.section>
  );
};

export default SalariesSection;
