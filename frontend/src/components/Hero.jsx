import React from 'react';
import { Mic, FileDown, Sparkles, Shield, ArrowRight } from 'lucide-react';

const Hero = ({ onGetStarted }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-sans tracking-tight mb-6 max-w-4xl mx-auto leading-none text-slate-900 dark:text-white">
          Every Language, <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-brand-600 via-violet-500 to-indigo-600 dark:from-brand-400 dark:via-violet-400 dark:to-indigo-400 bg-clip-text text-transparent glow-text">
            One Voice
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
          Bhashini breaks communication barriers instantly. Speak, type, or translate documents with AI auto-detection, speech synthesis, and analytics tools.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-xl shadow-brand-500/20 hover:shadow-brand-500/35 active:scale-[0.98] transition-all group"
          >
            Start Translating
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass-panel hover:bg-white/80 dark:hover:bg-slate-900/80 border text-slate-700 dark:text-slate-200 font-medium active:scale-[0.98] transition-all"
          >
            Explore Features
          </a>
        </div>

        {/* Floating Feature Grid */}
        <div id="features" className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="glass-card p-6 rounded-2xl text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Auto-Detection</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Instant source language detection via langdetect.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Voice Input</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hands-free text-to-speech with browser recognition.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <FileDown className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">PDF Export</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Download formatted translation summaries generated via ReportLab.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Local Privacy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Translation history and dashboard saved in browser storage.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
