import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center border shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500"></div>
            
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 dark:bg-red-500/20 text-red-500 rounded-full">
                <AlertTriangle className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <h2 className="text-2xl font-bold font-sans tracking-tight mb-2">Something went wrong</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              An unexpected error occurred in the application. Please try reloading the page or reset.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-900/50 text-left font-mono text-xs overflow-auto max-h-32 text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-800">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-lg hover:shadow-brand-500/20 active:scale-[0.98] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reset & Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
