import React from "react";
import { motion, Variants } from "framer-motion";
import { MdVerified, MdGroups, MdSchool } from "react-icons/md";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const cardPopUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const features = [
  {
    icon: <MdSchool size={28} />,
    title: "محتوى موثوق",
    desc: "معلومات دقيقة عن التخصصات والكليات والمنح الدراسية، محدثة باستمرار.",
  },
  {
    icon: <MdGroups size={28} />,
    title: "مجتمع طلابي",
    desc: "شارك ملخصاتك واستفد من تجارب آلاف الطلاب الذين سبقوك في نفس المسار.",
  },
  {
    icon: <MdVerified size={28} />,
    title: "إرشاد أكاديمي",
    desc: "تواصل مباشرة مع مستشارين أكاديميين للحصول على نصائح مخصصة لمسارك.",
  },
];

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-bgSection">
      <div className="container">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Text side */}
          <motion.div variants={fadeUp}>
            <h2 className="font-bold text-3xl md:text-4xl text-primary mb-10">
              من نحن
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-4">
              بيت الطالب هي المنصة الأكاديمية الأولى في العالم العربي، صُممت
              لمساعدة الطلاب على اتخاذ قرارات مدروسة بشأن مستقبلهم التعليمي
              والمهني.
            </p>
            <p className="text-gray-500 leading-relaxed">
              نوفر معلومات شاملة عن التخصصات الجامعية، الكليات، فرص المنح
              الدراسية، وملخصات أكاديمية يشاركها الطلاب أنفسهم، كل ذلك في مكان
              واحد يسهل الوصول إليه.
            </p>
          </motion.div>

          {/* Features side */}
          <motion.div variants={container} className="flex flex-col gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={cardPopUp}
                className="flex items-start gap-4 bg-white rounded-2xl border border-gray-200 p-5 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-accent flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
