import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "./Button";

interface NavLink {
  label: string;
  path: string;
}

const links: NavLink[] = [
  { label: "الرئيسية", path: "/" },
  { label: "من نحن", path: "/about" },
  { label: "تواصل معنا", path: "/contact" },
  { label: "التخصصات", path: "/colleges" },
];
const navVariants: Variants = {
  hidden: { y: -80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

const linksVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const linkItem = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      className="sticky top-0 z-50 bg-primary border-b border-white/10"
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold text-paragraph no-underline">
          🎓 بيت <span className="text-accent">الطالب</span>
        </Link>

        {/* LINKS Desktop */}
        <div className="hidden lg:flex items-center gap-6">
          <motion.ul
            className="flex items-center gap-6 m-0 p-0 list-none"
            variants={linksVariants}
            initial="hidden"
            animate="visible"
          >
            {links.map((item) => (
              <motion.li key={item.label} variants={linkItem}>
                <Link
                  to={item.path}
                  className="text-paragraph hover:text-accent transition-colors text-lg no-underline font-semibold"
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* BUTTON (always visible) */}
        <Link to="/auth" className="hidden lg:block">
          <Button>تسجيل الدخول</Button>
        </Link>

        {/* BURGER Mobile */}
        <button
          className="lg:hidden p-2 text-accent focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-primary overflow-hidden"
          >
            <ul className="flex flex-col items-center gap-4 py-4 list-none m-0 p-0">
              {links.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-paragraph hover:text-accent transition-colors text-lg no-underline font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/auth">
                  <Button>تسجيل الدخول</Button>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
