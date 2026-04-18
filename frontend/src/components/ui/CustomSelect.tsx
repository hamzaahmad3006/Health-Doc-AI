import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, LucideIcon } from "lucide-react";

interface Option {
  id: string | number;
  name: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  label: string;
  icon?: LucideIcon;
  placeholder?: string;
  allLabel?: string;
  hideAllOption?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  label,
  icon: Icon,
  placeholder = "Select an option",
  allLabel = "Select Patient",
  hideAllOption = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);
  const displayText = selectedOption ? selectedOption.name : allLabel;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group/selector" ref={containerRef}>
      {/* Background Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-sky-500/20 rounded-xl blur opacity-0 group-hover/selector:opacity-100 transition duration-500"></div>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-3 px-5 py-3 bg-slate-900/80 border ${
          isOpen ? "border-blue-500/50" : "border-slate-700/50"
        } rounded-xl hover:border-blue-500/50 transition-all backdrop-blur-xl w-full min-w-[220px] text-left`}
      >
        {Icon && (
          <div className="flex items-center justify-center w-6 h-6 bg-blue-500/10 rounded-lg text-blue-400">
            <Icon size={14} />
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[2px]">
            {label}
          </span>
          <span className="text-xs font-black text-white truncate">
            {displayText}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] top-full left-0 right-0 mt-2 bg-[#0b1221]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden py-2"
          >
            {/* Scrollable area */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {/* "All" Option */}
              {!hideAllOption && (
                <button
                  onClick={() => {
                    onChange(null);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-3 text-xs font-bold transition-all hover:bg-white/5 ${
                    value === null ? "text-white" : "text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {value === null && <Check size={14} className="text-blue-400" />}
                    <span>{allLabel}</span>
                  </div>
                </button>
              )}

              {/* Patient Options */}
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-3 text-xs font-bold transition-all hover:bg-white/5 ${
                    value === option.id ? "text-white" : "text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {value === option.id && (
                      <Check size={14} className="text-blue-400" />
                    )}
                    <span className={value === option.id ? "ml-0" : "ml-0"}>
                      {option.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
