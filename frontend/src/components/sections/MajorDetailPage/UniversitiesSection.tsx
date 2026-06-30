import React from "react";
import { motion, Variants } from "framer-motion";
import { GrLinkPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

interface UniversityItem {
  name: string;
  location: string;
  link: string;
}

interface Props {
  content: string;
  sectionRef: (el: HTMLElement | null) => void;
}

const UniversitiesSection: React.FC<Props> = ({ content, sectionRef }) => {
  let unis: UniversityItem[] = [];
  try {
    unis = JSON.parse(content);
  } catch {
    unis = [];
  }

  return (
    <motion.section
      ref={sectionRef}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {unis.length > 0 ? (
          unis.map((uni, i) => (
            <div
              key={i}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-6 hover:bg-bgSection transition-colors"
            >
              <div>
                <h4 className="font-bold text-primary">{uni.name}</h4>
                <p className="text-gray-500 text-sm mt-1">{uni.location}</p>
              </div>
              <Link
                to={uni.link || "#"}
                className="flex items-center gap-1 text-primary font-semibold no-underline hover:text-accent transition-colors text-sm"
              >
                شروط القبول <GrLinkPrevious />
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500">{content}</p>
        )}
      </div>
    </motion.section>
  );
};

export default UniversitiesSection;
