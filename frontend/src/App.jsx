import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Workspace from './components/Workspace';
import HistorySidebar from './components/HistorySidebar';
import AnalyticsPanel from './components/AnalyticsPanel';
import CommandPalette from './components/CommandPalette';
import { useTheme } from './context/ThemeContext';
import axios from 'axios';
import { Languages, Terminal, BarChart3, History, Cpu } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : '/_/backend');

const App = () => {
  const { isDark, toggleTheme } = useTheme();

  // Translation States
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');

  // Drawer / Overlay States
  const [historyOpen, setHistoryOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Health check
  const [backendHealthy, setBackendHealthy] = useState(false);

  // Persistent States (Local Storage)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('bhashini_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [analytics, setAnalytics] = useState(() => {
    try {
      const saved = localStorage.getItem('bhashini_analytics');
      const defaultStats = {
        totalTranslations: 0,
        favoritePair: 'None',
        totalCharacters: 0,
        totalWords: 0,
        lastTranslationTime: '',
        pairFrequencies: {}
      };
      return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    } catch {
      return {
        totalTranslations: 0,
        favoritePair: 'None',
        totalCharacters: 0,
        totalWords: 0,
        lastTranslationTime: '',
        pairFrequencies: {}
      };
    }
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Command palette callback hooks (bridge to workspace functions)
  const [workspaceActions, setWorkspaceActions] = useState({
    clearInput: () => {},
    swapLanguages: () => {},
    copyTranslation: () => {},
    exportPdf: () => {},
    hasTranslation: false,
    hasInput: false
  });

  // Check backend health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/health`);
        if (res.status === 200) {
          setBackendHealthy(true);
        }
      } catch (err) {
        setBackendHealthy(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard listener for Cmd+K / Ctrl+K (Command Palette)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state helpers to localStorage
  useEffect(() => {
    localStorage.setItem('bhashini_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('bhashini_analytics', JSON.stringify(analytics));
  }, [analytics]);

  // Toast Trigger
  const showToast = (message, type = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Add translation logs
  const handleAddHistory = (item) => {
    setHistory(prev => {
      const updated = [item, ...prev];
      return updated.slice(0, 50); // limit to 50 items
    });
  };

  // Update analytics metrics
  const handleUpdateAnalytics = ({ text, source, target }) => {
    const wCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const cCount = text.length;
    const pair = `${source.toUpperCase()} → ${target.toUpperCase()}`;

    setAnalytics(prev => {
      const freqs = { ...prev.pairFrequencies };
      freqs[pair] = (freqs[pair] || 0) + 1;

      // Find favorite pair
      let favPair = prev.favoritePair;
      let maxFreq = 0;
      Object.entries(freqs).forEach(([k, v]) => {
        if (v > maxFreq) {
          maxFreq = v;
          favPair = k;
        }
      });

      return {
        totalTranslations: prev.totalTranslations + 1,
        favoritePair: favPair,
        totalCharacters: prev.totalCharacters + cCount,
        totalWords: prev.totalWords + wCount,
        lastTranslationTime: new Date().toISOString(),
        pairFrequencies: freqs
      };
    });
  };

  // Clear analytics
  const handleResetAnalytics = () => {
    setAnalytics({
      totalTranslations: 0,
      favoritePair: 'None',
      totalCharacters: 0,
      totalWords: 0,
      lastTranslationTime: '',
      pairFrequencies: {}
    });
    showToast('Analytics statistics reset', 'success');
  };

  // Delete log item
  const handleDeleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    showToast('Item deleted from history', 'info');
  };

  // Clear log history
  const handleClearHistory = () => {
    setHistory([]);
    showToast('Translation history cleared', 'success');
  };

  // Recall log item
  const handleSelectHistoryItem = (item) => {
    setInputText(item.text);
    setSourceLang(item.source);
    setTargetLang(item.target);
    setHistoryOpen(false);
    showToast('Loaded translation parameters', 'success');
    
    // Smooth scroll down to workspace
    const workspaceEl = document.getElementById('workspace-section');
    if (workspaceEl) {
      workspaceEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollWorkspaceIntoView = () => {
    const workspaceEl = document.getElementById('workspace-section');
    if (workspaceEl) {
      workspaceEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Google Style Minimalist Geometric Background */}
      <div className="bg-mesh select-none pointer-events-none">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#1f2937_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-70"></div>
        
        {/* Geometric Shapes */}
        {/* Google Blue Circle Top-Left */}
        <div className="absolute top-[12%] left-[6%] w-28 h-28 rounded-full border-[5px] border-blue-500/10 dark:border-blue-500/15 shape-float"></div>
        
        {/* Google Red Pill Top-Right */}
        <div className="absolute top-[14%] right-[8%] w-20 h-40 rounded-[28px] bg-red-500/[0.05] dark:bg-red-500/[0.08] rotate-45 shape-float-reverse"></div>
        
        {/* Google Yellow Circle Bottom-Left */}
        <div className="absolute bottom-[18%] left-[4%] w-36 h-36 rounded-full bg-yellow-500/[0.05] dark:bg-yellow-500/[0.08] shape-float-reverse"></div>
        
        {/* Google Green Square Bottom-Right */}
        <div className="absolute bottom-[12%] right-[6%] w-20 h-20 rounded-[20px] border-[5px] border-green-500/10 dark:border-green-500/15 rotate-12 shape-float"></div>
        
        {/* Google Blue Pill Center-Right */}
        <div className="absolute top-[50%] right-[3%] w-36 h-14 rounded-full border-[5px] border-blue-500/8 dark:border-blue-500/12 -rotate-12 shape-float"></div>
        
        {/* Google Red Circle Center-Left */}
        <div className="absolute top-[48%] left-[12%] w-14 h-14 rounded-full border-[3px] border-red-500/10 dark:border-red-500/15 shape-float-reverse"></div>

        {/* Soft Google gradients overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(66,133,244,0.02),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(52,168,83,0.02),transparent_40%)]"></div>
      </div>

      {/* Global Navigation */}
      <Navbar 
        onToggleHistory={() => setHistoryOpen(prev => !prev)}
        onToggleAnalytics={() => setAnalyticsOpen(prev => !prev)}
        onOpenPalette={() => setPaletteOpen(true)}
        backendHealthy={backendHealthy}
      />

      {/* Hero Section */}
      <Hero onGetStarted={scrollWorkspaceIntoView} />

      {/* Main Workspace Section */}
      <main id="workspace-section" className="flex-1 pb-16 scroll-mt-20">
        <Workspace 
          inputText={inputText}
          setInputText={setInputText}
          sourceLang={sourceLang}
          setSourceLang={setSourceLang}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          onAddHistory={handleAddHistory}
          onUpdateAnalytics={handleUpdateAnalytics}
          showToast={showToast}
          setWorkspaceActions={setWorkspaceActions}
        />
      </main>

      {/* Studio Style Centered Premium Footer */}
      <footer className="w-full bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/40 py-16 mt-20 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 text-white shadow-lg shadow-brand-500/20">
              <Languages className="w-5.5 h-5.5" />
            </div>
            <span className="text-xl font-bold font-sans tracking-wider uppercase bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
              bhashini
            </span>
          </div>

          {/* Subtitle / Value Propositions Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-10 text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              <span>Instant Translation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              <span>Speech-to-Text Synthesis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              <span>Secure Document Exports</span>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full border-t border-slate-200/60 dark:border-slate-800/60 mb-10"></div>

          {/* Main Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mb-8 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <a href="#workspace-section" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Workspace</a>
            <button onClick={() => setAnalyticsOpen(true)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer bg-transparent border-none">Analytics</button>
            <button onClick={() => setHistoryOpen(true)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer bg-transparent border-none">History</button>
            <button onClick={() => setPaletteOpen(true)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer bg-transparent border-none">Actions</button>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Support</a>
          </div>

          {/* Interactive Icon Buttons */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <button 
              onClick={() => setPaletteOpen(true)}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 dark:hover:border-brand-500 hover:scale-105 transition-all shadow-sm hover:shadow"
              title="Command Palette"
            >
              <Terminal className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setAnalyticsOpen(true)}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 dark:hover:border-brand-500 hover:scale-105 transition-all shadow-sm hover:shadow"
              title="Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setHistoryOpen(true)}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 dark:hover:border-brand-500 hover:scale-105 transition-all shadow-sm hover:shadow"
              title="Translation History"
            >
              <History className="w-5 h-5" />
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 dark:hover:border-brand-500 hover:scale-105 transition-all shadow-sm hover:shadow"
              title="Source Code"
            >
              <Cpu className="w-5 h-5" />
            </a>
          </div>

          {/* Policy Links */}
          <div className="flex items-center justify-center gap-3 mb-4 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Terms & Conditions</span>
            <span>|</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span>|</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Disclosures</span>
          </div>

          {/* Copyright Notice */}
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            © 2026 Bhashini. All Rights Reserved.
          </div>

        </div>
      </footer>

      {/* Overlays / Sidebars */}
      <HistorySidebar 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onDeleteItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
      />

      <AnalyticsPanel 
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        analytics={analytics}
        onResetAnalytics={handleResetAnalytics}
      />

      <CommandPalette 
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onToggleTheme={toggleTheme}
        onClearInput={workspaceActions.clearInput}
        onSwapLanguages={workspaceActions.swapLanguages}
        onCopyTranslation={workspaceActions.copyTranslation}
        onExportPdf={workspaceActions.exportPdf}
        onOpenHistory={() => { setHistoryOpen(true); setPaletteOpen(false); }}
        onOpenAnalytics={() => { setAnalyticsOpen(true); setPaletteOpen(false); }}
        onSetSourceLanguage={setSourceLang}
        onSetTargetLanguage={setTargetLang}
        isDark={isDark}
        hasTranslation={workspaceActions.hasTranslation}
        hasInput={workspaceActions.hasInput}
      />

      {/* Custom styled Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`glass-panel border-l-4 px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between text-xs font-semibold pointer-events-auto animate-slide-in ${
              toast.type === 'success' ? 'border-emerald-500 text-emerald-800 dark:text-emerald-200 bg-white/95 dark:bg-slate-900/95' :
              toast.type === 'error' ? 'border-red-500 text-red-800 dark:text-red-200 bg-white/95 dark:bg-slate-900/95' :
              toast.type === 'warning' ? 'border-amber-500 text-amber-800 dark:text-amber-200 bg-white/95 dark:bg-slate-900/95' :
              'border-brand-500 text-slate-800 dark:text-slate-200 bg-white/95 dark:bg-slate-900/95'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
