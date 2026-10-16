import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.95, transition: { duration: 0.1 } }}
      disabled={disabled}
      className={`rounded-2xl font-semibold text-lg p-2 bg-hero text-paragraph border border-paragraph outline-none transition-all duration-300 ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className || ""}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
export default Button;
