import React from "react";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

interface Props {
  content: string;
  sectionRef: (el: HTMLElement | null) => void;
}

const OverviewSection: React.FC<Props> = ({ content, sectionRef }) => {
  return (
    <motion.section
      ref={sectionRef}
      id="overview"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <h2 className="font-bold text-xl text-primary mb-4">شرح عام عن التخصص</h2>
      <p className="text-gray-500 leading-relaxed">{content}</p>
    </motion.section>
  );
};

export default OverviewSection;
