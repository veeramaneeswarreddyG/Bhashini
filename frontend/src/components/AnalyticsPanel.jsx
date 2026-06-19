import React from 'react';
import { X, BarChart3, Activity, Clock, FileText, Languages, RefreshCw } from 'lucide-react';

const AnalyticsPanel = ({ 
  isOpen, 
  onClose, 
  analytics, 
  onResetAnalytics 
}) => {
  if (!isOpen) return null;

  const stats = [
    {
      id: 'total',
      name: 'Total Translations',
      value: analytics.totalTranslations || 0,
      icon: Activity,
      color: 'text-brand-600 dark:text-brand-400 bg-brand-500/10 dark:bg-brand-500/20'
    },
    {
      id: 'languages',
      name: 'Favorite Pair',
      value: analytics.favoritePair || 'None',
      icon: Languages,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20'
    },
    {
      id: 'chars',
      name: 'Total Characters',
      value: analytics.totalCharacters || 0,
      icon: FileText,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20'
    },
    {
      id: 'words',
      name: 'Total Words',
      value: analytics.totalWords || 0,
      icon: FileText,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full sm:w-[450px] h-full flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-l border-slate-200/50 dark:border-slate-800/50 text-slate-900 dark:text-slate-100 shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span className="font-bold font-sans text-lg">Platform Analytics</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="glass-card p-5 rounded-2xl border flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {stat.name}
                    </span>
                    <div className={`p-2 rounded-xl ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold truncate max-w-full text-slate-900 dark:text-white" title={stat.value}>
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Last translation metadata info */}
          <div className="glass-card p-5 rounded-2xl border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Last Activity</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Time of your recent translation</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {analytics.lastTranslationTime 
                ? new Date(analytics.lastTranslationTime).toLocaleString() 
                : 'No translations registered yet'}
            </p>
          </div>

          {/* Graphic/Visual Mockup */}
          <div className="glass-card p-5 rounded-2xl border">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Translation Efficiency</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  <span>Average Translation Time</span>
                  <span>0.4s</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  <span>API Cache Hits</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer clear action */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
          <button
            onClick={onResetAnalytics}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Analytics Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
