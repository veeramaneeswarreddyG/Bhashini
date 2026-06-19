import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, Sparkles } from 'lucide-react';

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  showAuto = false,
  label = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = showAuto && value === 'auto' 
    ? { code: 'auto', name: 'Auto Detect' }
    : options.find(opt => opt.code === value);

  // Filter options based on search query
  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full sm:w-56" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearchQuery(""); }}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 backdrop-blur-md text-sm font-semibold shadow-sm text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-900/60 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-left cursor-pointer"
      >
        <span className="truncate flex items-center gap-1.5">
          {showAuto && value === 'auto' && <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />}
          {selectedOption ? selectedOption.name : label}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full min-w-[220px] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-lg z-50 p-2 overflow-hidden animate-fade-in max-h-[300px] flex flex-col">
          {/* Search box inside dropdown */}
          <div className="relative mb-2 p-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* List Container */}
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            {showAuto && searchQuery === "" && (
              <button
                type="button"
                onClick={() => { onChange('auto'); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  value === 'auto'
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  Auto Detect
                </span>
                {value === 'auto' && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
              </button>
            )}

            {filteredOptions.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">
                No languages found
              </div>
            )}

            {filteredOptions.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => { onChange(opt.code); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  value === opt.code
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>{opt.name}</span>
                {value === opt.code && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
