import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <motion.button
      onClick={toggleDarkMode}
      className={cn(
        "relative p-2 rounded-md bg-surface-100/50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700",
        "hover:bg-surface-200/70 dark:hover:bg-surface-700/70 backdrop-blur-sm",
        "transition-all shadow-sm",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-5 h-5">
        <motion.div
          initial={false}
          animate={{
            scale: isDarkMode ? 0 : 1,
            opacity: isDarkMode ? 0 : 1,
            rotate: isDarkMode ? 45 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun size={20} className="text-amber-500" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            scale: isDarkMode ? 1 : 0,
            opacity: isDarkMode ? 1 : 0,
            rotate: isDarkMode ? 0 : -45,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon size={20} className="text-blue-400" />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default ThemeToggle;
