import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">System Exception Detected</h2>
            <p className="text-sm text-slate-500 mb-8 font-medium"> The application encountered an unexpected internal error. Diagnostic data has been logged to the institutional console. </p>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stack Trace Excerpt</p>
              <code className="text-[10px] font-mono text-rose-600 break-all">
                {this.state.error?.message}
              </code>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Application Instance
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
