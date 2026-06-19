import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Languages, Moon, Sun, History, BarChart3, Terminal, Cpu } from 'lucide-react';

const Navbar = ({ 
  onToggleHistory, 
  onToggleAnalytics, 
  onOpenPalette,
  backendHealthy 
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 text-white shadow-lg shadow-brand-500/20">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-sans tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
                  bhashini
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
                Every Language, One Voice
              </span>
            </div>
          </div>

          {/* Action Items */}
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 mr-2 text-slate-500 dark:text-slate-400">
              {backendHealthy ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Engine Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>Backend Offline</span>
                </>
              )}
            </div>

            {/* Command Palette Button */}
            <button
              onClick={onOpenPalette}
              title="Open Command Palette (Ctrl+K)"
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800/50 text-slate-600 dark:text-slate-300 transition-all"
            >
              <Terminal className="w-5 h-5" />
            </button>

            {/* Analytics button */}
            <button
              onClick={onToggleAnalytics}
              title="Toggle Analytics Panel"
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800/50 text-slate-600 dark:text-slate-300 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            {/* History button */}
            <button
              onClick={onToggleHistory}
              title="Toggle History Sidebar"
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800/50 text-slate-600 dark:text-slate-300 transition-all"
            >
              <History className="w-5 h-5" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Light/Dark Theme"
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800/50 text-slate-600 dark:text-slate-300 transition-all"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
