/**
 * Error Boundary Component
 * 
 * Catches React errors anywhere in the component tree,
 * logs them, and displays a fallback UI instead of crashing the entire app.
 * 
 * Phase 2 Week 2: Issue #16 - Error Boundaries
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Fallback UI
 * Displayed when an error is caught
 */
function ErrorFallback({ error, resetError }: { error: Error | null; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mb-4">
            <span className="text-6xl">⚠️</span>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something Went Wrong
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>

          {/* Technical Details (collapsed by default) */}
          {error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                Technical details
              </summary>
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono overflow-auto max-h-32">
                <p className="text-red-600 dark:text-red-400 font-semibold mb-1">
                  {error.name}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {error.message}
                </p>
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={resetError}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Error Boundary Class Component
 * 
 * Note: Error boundaries must be class components as of React 18
 * Functional components with hooks cannot catch errors yet
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state so the next render will show the fallback UI
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * Log the error to our logging service
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development, to monitoring service in production
    logger.error('React Error Boundary caught an error:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorMessage: error.message,
      errorName: error.name,
    });

    // Update state with error info for display
    this.setState({
      errorInfo,
    });

    // TODO: In production, send to error monitoring service (e.g., Sentry)
    // if (import.meta.env.PROD) {
    //   sendToMonitoringService(error, errorInfo);
    // }
  }

  /**
   * Reset error state to try rendering children again
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          resetError={this.resetError}
        />
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;

