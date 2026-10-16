import React from "react";
import { motion, Variants } from "framer-motion";
import {
  FaHospitalAlt,
  FaUserNurse,
  FaGraduationCap,
  FaClinicMedical,
  FaChalkboardTeacher, 
  FaMicroscope,
} from "react-icons/fa";
import { IoIosGitCompare } from "react-icons/io";
import { FaUserDoctor } from "react-icons/fa6";
import { FaBriefcase } from "react-icons/fa";
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

interface JobItem {
  icon: string;
  label: string;
}

interface Props {
  content: string;
  sectionRef: (el: HTMLElement | null) => void;
}

// Icon map to convert string names from JSON into React components
const iconMap: Record<string, React.ReactNode> = {
  FaHospitalAlt: <FaHospitalAlt size={28} />,
  FaClinicMedical: <FaClinicMedical size={28} />,
  FaUserNurse: <FaUserNurse size={28} />,
  IoIosGitCompare: <IoIosGitCompare size={28} />,
  FaGraduationCap: <FaGraduationCap size={28} />,
  FaUserDoctor: <FaUserDoctor size={28} />,
  FaChalkboardTeacher: <FaChalkboardTeacher size={28} />,
  FaMicroscope: <FaMicroscope size={28} />,
};

const JobSection: React.FC<Props> = ({ content, sectionRef }) => {
  let jobs: JobItem[] = [];
  try {
    jobs = JSON.parse(content);
  } catch {
    jobs = [];
  }

  return (
    <motion.section
      ref={sectionRef}
      id="jobs"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <h2 className="font-bold text-2xl text-primary mb-4">مجالات سوق العمل</h2>
      <div className="flex flex-col gap-3">
        {jobs.length > 0 ? (
          jobs.map((job, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border border-gray-100 rounded-xl p-4 hover:bg-bgSection transition-colors"
            >
              <span className="text-2xl text-accent">
                {iconMap[job.icon] || <FaBriefcase size={28} />}
              </span>
              <span className="font-semibold text-primary">{job.label}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">{content}</p>
        )}
      </div>
    </motion.section>
  );
};

export default JobSection;
