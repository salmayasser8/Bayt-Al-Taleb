import { motion, Variants } from "framer-motion";
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
// ── Pagination Component ──────────────────────────────────────────
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null; // Don't show pagination if only 1 page

  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center gap-2 mt-10 mb-4"
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-primary hover:bg-bgSection transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        السابق
      </button>

      {/* Page Numbers */}
      {getPages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
            currentPage === page
              ? "bg-primary text-paragraph"
              : "border border-gray-200 text-primary hover:bg-bgSection"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-primary hover:bg-bgSection transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        التالي
      </button>
    </motion.div>
  );
};

export default Pagination;
