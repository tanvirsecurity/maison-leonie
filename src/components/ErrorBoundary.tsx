import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'An unexpected error occurred.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#0E0D0C] text-[#161412] dark:text-[#F4F0EA] p-8">
          <div className="max-w-lg w-full border border-[#E5DFD5] dark:border-[#2B2723] bg-white dark:bg-[#171513] p-8">
            <p className="text-xs tracking-widest uppercase text-[#9A7B4F] mb-2">
              Maison Léonie · Atelier Notice
            </p>
            <h2 className="text-2xl font-editorial mb-3">
              We encountered an interruption
            </h2>
            <p className="text-sm text-[#6B655E] dark:text-[#A39C93] mb-6 leading-relaxed">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 text-xs tracking-wider uppercase bg-[#161412] text-[#FAF8F5] dark:bg-[#C8A97E] dark:text-[#0E0D0C] hover:opacity-90 transition-opacity"
            >
              Return to Boutique
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
