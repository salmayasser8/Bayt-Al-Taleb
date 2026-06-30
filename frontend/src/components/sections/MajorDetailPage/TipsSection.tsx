// import React, { useState } from "react";
// import { motion, AnimatePresence, Variants } from "framer-motion";
// import { FaChevronDown, FaQuestion } from "react-icons/fa";

// export interface FaqView {
//   id: string;
//   content: string;
//   question: string;
//   answer: string;
// }

// const fadeUp: Variants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
// };

// const FAQItem: React.FC<{ item: FaqView }> = ({ item }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   return (
//     <div className="border border-gray-200 rounded-xl overflow-hidden">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="w-full flex items-center justify-between px-6 py-4 text-right font-bold text-primary hover:bg-bgSection transition-colors"
//       >
//         <span className="flex items-center gap-2">
//           <FaQuestion size={18} className="text-accent" /> {item.question}
//         </span>
//         <FaChevronDown
//           className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
//         />
//       </button>
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             className="overflow-hidden"
//           >
//             <p className="px-6 py-4 text-gray-500 border-t border-gray-100">
//               {item.answer}
//             </p>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// interface Props {
//   faqs: FaqView[];
//   sectionRef: (el: HTMLElement | null) => void;
// }

// const TipsSection: React.FC<Props> = ({ faqs, sectionRef }) => {
//   return (
//     <motion.section
//       ref={sectionRef}
//       id="tips"
//       variants={fadeUp}
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: false, amount: 0.2 }}
//       className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
//     >
//       <h2 className="font-bold text-2xl text-primary mb-4">
//         نصائح وأسئلة شائعة
//       </h2>
//       <div className="flex flex-col gap-3">
//         {faqs.length > 0 ? (
//           faqs.map((faq) => <FAQItem key={faq.id} item={faq} />)
//         ) : (
//           <p className="text-center text-gray-400 py-8">
//             لا توجد أسئلة شائعة مضافة بعد.
//           </p>
//         )}
//       </div>
//     </motion.section>
//   );
// };

// export default TipsSection;
