import React, { useState, useEffect, useRef } from 'react';
import { 
  Languages, 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  FileDown, 
  Sparkles, 
  CornerDownLeft, 
  Loader2, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { translationApi } from '../services/api';
import CustomSelect from './CustomSelect';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' }
];

const Workspace = ({ 
  inputText, 
  setInputText, 
  sourceLang, 
  setSourceLang, 
  targetLang, 
  setTargetLang, 
  onAddHistory, 
  onUpdateAnalytics,
  showToast,
  setWorkspaceActions
}) => {
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Copy states
  const [copiedSrc, setCopiedSrc] = useState(false);
  const [copiedTgt, setCopiedTgt] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Text to Speech States
  const [ttsState, setTtsState] = useState('stopped'); // stopped, playing, paused
  const utteranceRef = useRef(null);

  // Refs for tracking translate state
  const isTranslatingRef = useRef(false);

  // Bind shortcuts and commands back to App.jsx / Command Palette
  useEffect(() => {
    if (setWorkspaceActions) {
      setWorkspaceActions({
        clearInput: handleClear,
        swapLanguages: handleSwapLanguages,
        copyTranslation: () => handleCopyText(translatedText, setCopiedTgt),
        exportPdf: handleExportPdf,
        hasTranslation: !!translatedText,
        hasInput: !!inputText
      });
    }
  }, [inputText, translatedText, sourceLang, targetLang]);

  // Clean up synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech API - Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      
      // Determine language hint
      rec.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;
      
      rec.onresult = (event) => {
        const resultText = event.results[event.results.length - 1][0].transcript;
        setInputText(prev => prev ? prev + ' ' + resultText : resultText);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          showToast('Microphone access denied', 'error');
        } else {
          showToast(`Speech recognition error: ${event.error}`, 'error');
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [sourceLang]);

  // Handle Voice Input Toggle
  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      showToast('Speech Recognition not supported in this browser. Try Chrome/Edge.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;
        recognitionRef.current.start();
        setIsListening(true);
        showToast('Listening... Speak clearly.', 'success');
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  // Keyboard shortcut listener for translation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleTranslate();
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleToggleVoice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputText, sourceLang, targetLang]);

  // Translate Action
  const handleTranslate = async () => {
    if (!inputText || !inputText.trim()) {
      showToast('Please enter text to translate', 'warning');
      return;
    }
    
    setLoading(true);
    setError('');
    setTranslatedText('');
    setDetectedLang('');

    // Stop TTS if playing
    handleStopTts();

    try {
      const data = await translationApi.translate(inputText, sourceLang, targetLang);
      setTranslatedText(data.translatedText);
      
      // Update auto detection tag
      if (sourceLang === 'auto' && data.detectedLanguage) {
        setDetectedLang(data.detectedLanguage);
      }

      // Save to History
      const historyItem = {
        id: Date.now().toString(),
        text: inputText,
        translatedText: data.translatedText,
        source: sourceLang,
        detectedLanguage: data.detectedLanguage || sourceLang,
        target: targetLang,
        timestamp: new Date().toISOString()
      };
      onAddHistory(historyItem);

      // Update Analytics
      onUpdateAnalytics({
        text: inputText,
        source: sourceLang === 'auto' ? (data.detectedLanguage || 'en') : sourceLang,
        target: targetLang
      });

      showToast('Translation completed', 'success');
    } catch (err) {
      setError(err.message || 'Translation failed');
      showToast(err.message || 'Translation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Swap Source/Target Languages
  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      showToast('Cannot swap with Auto Detect source', 'warning');
      return;
    }
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    
    // Swap text too if translation exists
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  // Clear text inputs
  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setDetectedLang('');
    setError('');
    handleStopTts();
  };

  // Copy clipboards
  const handleCopyText = (text, setCopied) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        showToast('Copied to clipboard', 'success');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        showToast('Failed to copy', 'error');
      });
  };

  // ReportLab PDF Export trigger
  const handleExportPdf = async () => {
    if (!translatedText) return;
    showToast('Exporting to PDF...', 'success');
    try {
      const timestamp = new Date().toLocaleString();
      await translationApi.exportPdf(
        inputText,
        translatedText,
        sourceLang === 'auto' ? (detectedLang || 'auto') : sourceLang,
        targetLang,
        timestamp
      );
      showToast('PDF downloaded successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Text-To-Speech Controls
  const handlePlayPauseTts = () => {
    if (!translatedText) return;
    
    const synth = window.speechSynthesis;
    if (!synth) {
      showToast('Text to Speech is not supported in this browser.', 'warning');
      return;
    }

    if (ttsState === 'playing') {
      synth.cancel();
      setTtsState('stopped');
      showToast('Speech stopped', 'info');
    } else {
      synth.cancel(); // clear queue
      const utterance = new SpeechSynthesisUtterance(translatedText);
      
      // Dynamically select target voice for non-English translations
      const voices = synth.getVoices();
      const targetLangLower = targetLang.toLowerCase();
      const matchedVoice = voices.find(v => 
        v.lang.toLowerCase() === targetLangLower || 
        v.lang.toLowerCase().startsWith(targetLangLower) ||
        v.lang.toLowerCase().includes(targetLangLower)
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = targetLang;
      }
      
      utterance.onend = () => {
        setTtsState('stopped');
      };
      
      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error:', e);
        setTtsState('stopped');
        if (e.error !== 'interrupted') {
          showToast(`Speech synthesis failed: ${e.error || 'voice not installed for this language'}`, 'warning');
        }
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
      setTtsState('playing');
      showToast('Speaking translation...', 'success');
    }
  };

  const handleStopTts = () => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
    }
    setTtsState('stopped');
  };

  const getLanguageName = (code) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : code.toUpperCase();
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const characterCount = inputText.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Workspace Panel */}
      <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl overflow-hidden">
        
        {/* Language Selection Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 p-4 gap-4 bg-slate-50/50 dark:bg-slate-900/20">
          
          {/* Source Language Select */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">From:</span>
            <CustomSelect
              value={sourceLang}
              onChange={setSourceLang}
              options={SUPPORTED_LANGUAGES}
              showAuto={true}
              label="Select Source"
            />
            
            {detectedLang && sourceLang === 'auto' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-1 rounded-lg border border-brand-500/20 animate-pulse">
                <Sparkles className="w-3 h-3" />
                Detected: {getLanguageName(detectedLang)}
              </span>
            )}
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapLanguages}
            title="Swap Languages"
            disabled={sourceLang === 'auto'}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-950 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Target Language Select */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">To:</span>
            <CustomSelect
              value={targetLang}
              onChange={setTargetLang}
              options={SUPPORTED_LANGUAGES}
              showAuto={false}
              label="Select Target"
            />
          </div>
        </div>

        {/* Text Area Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/60 dark:divide-slate-800/60 min-h-[380px]">
          
          {/* Input Panel */}
          <div className="flex flex-col p-6 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or speak (Ctrl+Shift+S) the text you wish to translate..."
              className="flex-1 w-full bg-transparent resize-none border-none focus:outline-none text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-100 placeholder-slate-400"
              maxLength={5000}
            />
            
            {/* Input Action Panel */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/20 dark:border-slate-800/10">
              <div className="flex items-center gap-1.5">
                {/* Voice Input Button */}
                <button
                  onClick={handleToggleVoice}
                  title={isListening ? "Stop voice listening" : "Start voice recognition (Ctrl+Shift+S)"}
                  className={`p-3 rounded-xl border transition-all active:scale-[0.97] ${
                    isListening 
                      ? 'bg-red-500 border-red-500 text-white pulse-mic' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Copy Input Button */}
                <button
                  onClick={() => handleCopyText(inputText, setCopiedSrc)}
                  title="Copy Input Text"
                  disabled={!inputText}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
                >
                  {copiedSrc ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>

                {/* Reset Input Button */}
                <button
                  onClick={handleClear}
                  title="Clear Text"
                  disabled={!inputText}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Character Limit / Word Count */}
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <span>{wordCount} words</span>
                <span className="mx-2">•</span>
                <span>{characterCount}/5000 chars</span>
              </div>
            </div>
          </div>

          {/* Output / Result Panel */}
          <div className="flex flex-col p-6 bg-slate-50/30 dark:bg-slate-950/10">
            {loading ? (
              /* Skeleton Loader Screen */
              <div className="flex-1 flex flex-col justify-between animate-pulse">
                <div className="space-y-4">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-[90%]"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-[95%]"></div>
                </div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3 mt-6"></div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-red-500/10 dark:border-red-500/5 bg-red-500/5 dark:bg-red-500/10 rounded-2xl">
                <p className="text-sm font-semibold text-red-500 mb-1">Translation Failed</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
                <button
                  onClick={handleTranslate}
                  className="mt-4 px-4 py-2 rounded-xl text-xs bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-all active:scale-95"
                >
                  Retry Translation
                </button>
              </div>
            ) : translatedText ? (
              /* Success / Result State */
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex-1 text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-100 select-all overflow-y-auto whitespace-pre-wrap">
                  {translatedText}
                </div>
                
                {/* Result Action Panel */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/20 dark:border-slate-800/10">
                  <div className="flex items-center gap-1.5">
                    {/* TTS Speaker Buttons */}
                    <button
                      onClick={handlePlayPauseTts}
                      title={ttsState === 'playing' ? 'Pause spoken speech' : 'Read translation aloud'}
                      className={`p-3 rounded-xl border transition-all active:scale-[0.97] ${
                        ttsState === 'playing'
                          ? 'bg-brand-600 border-brand-600 text-white animate-pulse'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {ttsState === 'playing' ? <Volume2 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    
                    {ttsState !== 'stopped' && (
                      <button
                        onClick={handleStopTts}
                        title="Stop speech reader"
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-red-500 transition-all active:scale-[0.97]"
                      >
                        <VolumeX className="w-4 h-4" />
                      </button>
                    )}

                    {/* Copy Result Button */}
                    <button
                      onClick={() => handleCopyText(translatedText, setCopiedTgt)}
                      title="Copy Translated Text"
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400 transition-all active:scale-[0.97]"
                    >
                      {copiedTgt ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {/* Export PDF Button */}
                    <button
                      onClick={handleExportPdf}
                      title="Export translation to PDF"
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400 transition-all active:scale-[0.97]"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Provider label */}
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Powered by Bhashini API
                  </span>
                </div>
              </div>
            ) : (
              /* Beautiful Empty State */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-600">
                <BookOpen className="w-12 h-12 mb-3 stroke-1 text-slate-300 dark:text-slate-700" />
                <p className="font-semibold text-sm text-slate-500 dark:text-slate-400">Translation Workspace</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Enter some text on the left and select your languages to start translating instantly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Translate Button */}
        <div className="border-t border-slate-200/50 dark:border-slate-800/50 p-4 bg-slate-50/50 dark:bg-slate-900/20 flex justify-end">
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText || !inputText.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-lg hover:shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-4 h-4" />
                Translate Text
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 ml-3 rounded bg-brand-700 text-[10px] text-brand-200 font-mono">
                  Ctrl+Enter
                </kbd>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
