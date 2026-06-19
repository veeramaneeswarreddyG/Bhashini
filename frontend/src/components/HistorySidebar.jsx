import React, { useState } from 'react';
import { X, Trash2, Search, ArrowRight, ClipboardCopy, FileText } from 'lucide-react';

const HistorySidebar = ({ 
  isOpen, 
  onClose, 
  history, 
  onDeleteItem, 
  onClearHistory, 
  onSelectHistoryItem 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => 
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] z-50 flex shadow-2xl animate-slide-in">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-sm -z-10" 
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="w-full h-full flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-l border-slate-200/50 dark:border-slate-800/50 text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold font-sans text-lg">Translation History</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400">
              {history.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search translation history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm glass-input focus:outline-none"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="p-4 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 rounded-full mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <p className="font-semibold text-sm text-slate-600 dark:text-slate-400">No translations found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {searchQuery ? 'Try matching different keywords.' : 'Your translated sentences will appear here.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="group relative p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/20 hover:bg-brand-500/[0.02] dark:hover:bg-brand-500/[0.04] hover:border-brand-500/30 dark:hover:border-brand-500/20 cursor-pointer transition-all duration-200"
              >
                {/* Languages and Time */}
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="uppercase">{item.source === 'auto' ? `Auto (${item.detectedLanguage})` : item.source}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="uppercase">{item.target}</span>
                  </div>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Text blocks */}
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 mb-1">
                  {item.text}
                </p>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-medium line-clamp-2">
                  {item.translatedText}
                </p>

                {/* Individual delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  title="Delete Item"
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-100 hover:bg-red-500/10 dark:bg-slate-800/80 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 border border-transparent hover:border-red-500/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
            <button
              onClick={onClearHistory}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-500/20 dark:border-red-500/10 hover:bg-red-500/10 hover:border-red-500/35 text-red-600 dark:text-red-400 font-medium text-sm transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;
