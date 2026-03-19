import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    message?: string;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, message: error?.message || 'Unknown error' };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary caught error:', error, info);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white p-6">
                    <div className="max-w-md text-center bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-sm text-slate-300 mb-4">{this.state.message}</p>
                        <button
                            onClick={this.handleReload}
                            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md font-semibold"
                        >
                            Reload App
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
