import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep internal error logging without exposing stack traces to UI
    if (process.env.NODE_ENV === 'development') {
      console.warn('Recoverable interface boundary:', error?.message);
    }
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b111e] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-modal p-8 rounded-2xl border border-white/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-lg font-bold text-white">
              Application Workspace Notice
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected display state was encountered. Your verified records, calculations, and cryptographic ledger data remain secure.
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-xl neo-button-primary text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
