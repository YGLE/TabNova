import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[TabNova] Uncaught error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex items-center justify-center h-full text-center p-6">
            <div>
              <p className="text-red-400 font-semibold mb-2">Une erreur est survenue</p>
              <p className="text-gray-500 text-sm mb-4">{this.state.error?.message}</p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
              >
                Réessayer
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
