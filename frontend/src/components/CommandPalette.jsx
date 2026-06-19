import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Languages, Trash2, Moon, Sun, Clipboard, FileDown, History, BarChart3, Terminal } from 'lucide-react';

const CommandPalette = ({ 
  isOpen, 
  onClose, 
  onToggleTheme, 
  onClearInput, 
  onSwapLanguages, 
  onCopyTranslation, 
  onExportPdf, 
  onOpenHistory, 
  onOpenAnalytics, 
  onSetSourceLanguage, 
  onSetTargetLanguage,
  isDark,
  hasTranslation,
  hasInput 
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allCommands = [
    {
      id: 'theme',
      title: 'Toggle Dark/Light Mode',
      description: 'Switch between light and dark visual aesthetics',
      icon: isDark ? Sun : Moon,
      action: () => { onToggleTheme(); onClose(); },
      enabled: true
    },
    {
      id: 'clear',
      title: 'Clear Text Input',
      description: 'Wipe clean all characters in the source text area',
      icon: Trash2,
      action: () => { onClearInput(); onClose(); },
      enabled: hasInput
    },
    {
      id: 'swap',
      title: 'Swap Languages',
      description: 'Interchange the selected source and target languages',
      icon: Languages,
      action: () => { onSwapLanguages(); onClose(); },
      enabled: true
    },
    {
      id: 'copy',
      title: 'Copy Translation',
      description: 'Copy the translated output text to your clipboard',
      icon: Clipboard,
      action: () => { onCopyTranslation(); onClose(); },
      enabled: hasTranslation
    },
    {
      id: 'pdf',
      title: 'Export Translation to PDF',
      description: 'Download a clean, structured PDF of your translation via ReportLab',
      icon: FileDown,
      action: () => { onExportPdf(); onClose(); },
      enabled: hasTranslation
    },
    {
      id: 'history',
      title: 'Open History Sidebar',
      description: 'Browse, search, and recall previous translations',
      icon: History,
      action: () => { onOpenHistory(); onClose(); },
      enabled: true
    },
    {
      id: 'analytics',
      title: 'Open Analytics Panel',
      description: 'View dashboard showing translation frequencies and total metrics',
      icon: BarChart3,
      action: () => { onOpenAnalytics(); onClose(); },
      enabled: true
    },
    {
      id: 'src-auto',
      title: 'Set Source Language: Auto Detect',
      description: 'Set source text configuration to automatically recognize language',
      icon: Sparkles,
      action: () => { onSetSourceLanguage('auto'); onClose(); },
      enabled: true
    },
    {
      id: 'src-en',
      title: 'Set Source Language: English',
      description: 'Explicitly configure source language to English',
      icon: Languages,
      action: () => { onSetSourceLanguage('en'); onClose(); },
      enabled: true
    },
    {
      id: 'tgt-es',
      title: 'Set Target Language: Spanish',
      description: 'Set output translation language to Spanish',
      icon: Languages,
      action: () => { onSetTargetLanguage('es'); onClose(); },
      enabled: true
    },
    {
      id: 'tgt-fr',
      title: 'Set Target Language: French',
      description: 'Set output translation language to French',
      icon: Languages,
      action: () => { onSetTargetLanguage('fr'); onClose(); },
      enabled: true
    }
  ];

  const filteredCommands = allCommands.filter(cmd => 
    cmd.enabled && 
    (cmd.title.toLowerCase().includes(query.toLowerCase()) || 
     cmd.description.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    // Keep selection within bounds
    if (filteredCommands.length > 0 && selectedIndex >= filteredCommands.length) {
      setSelectedIndex(0);
    }
  }, [query, filteredCommands, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        scrollSelectedIntoView();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        scrollSelectedIntoView();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  const scrollSelectedIntoView = () => {
    const list = listRef.current;
    if (!list) return;
    const selectedEl = list.children[selectedIndex];
    if (!selectedEl) return;

    const listHeight = list.clientHeight;
    const elOffset = selectedEl.offsetTop;
    const elHeight = selectedEl.clientHeight;

    if (elOffset + elHeight > list.scrollTop + listHeight) {
      list.scrollTop = elOffset + elHeight - listHeight;
    } else if (elOffset < list.scrollTop) {
      list.scrollTop = elOffset;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Palette Card */}
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative flex flex-col overflow-hidden max-h-[450px] animate-fade-in">
        
        {/* Search Input */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800/80 p-4">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1"
        >
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <Terminal className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-500">No commands matched "{query}"</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                    idx === selectedIndex 
                      ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border-l-4 border-brand-500 pl-3' 
                      : 'text-slate-700 dark:text-slate-300 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${idx === selectedIndex ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{cmd.title}</p>
                    <p className={`text-[10px] truncate ${idx === selectedIndex ? 'text-brand-500/80 dark:text-brand-400/80' : 'text-slate-400 dark:text-slate-500'}`}>
                      {cmd.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
