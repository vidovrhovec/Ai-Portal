/**
 * React Error Boundaries for graceful error handling
 * Implements application-level, page-level, and component-level error boundaries
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { workflowErrorLogger } from '@/lib/logger';

// Error boundary props interface
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'application' | 'page' | 'component';
  name?: string;
}

// Error boundary state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Base Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = 'component', name = 'Unknown' } = this.props;

    // Log error to workflow memory
    workflowErrorLogger.logError(error, {
      level,
      component: name,
      errorBoundary: true,
      stack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} level={this.props.level} />;
    }

    return this.props.children;
  }
}

/**
 * Application-level Error Boundary
 * Catches errors at the root level of the application
 */
export class ApplicationErrorBoundary extends Component<{ children: ReactNode }> {
  render() {
    return (
      <ErrorBoundary
        level="application"
        name="ApplicationRoot"
        fallback={<ApplicationErrorFallback />}
        onError={(error, errorInfo) => {
          // Application-level error handling
          console.error('Application Error:', error, errorInfo);

          // Could send to error reporting service
          // reportErrorToService(error, errorInfo);
        }}
      >
        {this.props.children}
      </ErrorBoundary>
    );
  }
}

/**
 * Page-level Error Boundary
 * Catches errors within individual pages
 */
export class PageErrorBoundary extends Component<{ children: ReactNode; pageName?: string }> {
  render() {
    return (
      <ErrorBoundary
        level="page"
        name={this.props.pageName || 'Page'}
        fallback={<PageErrorFallback pageName={this.props.pageName} />}
        onError={(error, errorInfo) => {
          // Page-level error handling
          console.error(`Page Error (${this.props.pageName}):`, error, errorInfo);
        }}
      >
        {this.props.children}
      </ErrorBoundary>
    );
  }
}

/**
 * Component-level Error Boundary
 * Catches errors in critical components
 */
export class ComponentErrorBoundary extends Component<{
  children: ReactNode;
  componentName: string;
  fallback?: ReactNode;
}> {
  render() {
    return (
      <ErrorBoundary
        level="component"
        name={this.props.componentName}
        fallback={this.props.fallback || <ComponentErrorFallback componentName={this.props.componentName} />}
        onError={(error, errorInfo) => {
          // Component-level error handling
          console.error(`Component Error (${this.props.componentName}):`, error, errorInfo);
        }}
      >
        {this.props.children}
      </ErrorBoundary>
    );
  }
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({ error, level }: { error?: Error; level?: string }) {
  return (
    <div className="error-fallback p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center mb-4">
        <div className="shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {level ? `${level.charAt(0).toUpperCase() + level.slice(1)} Error` : 'Error'}
          </h3>
        </div>
      </div>
      <div className="ml-8">
        <p className="text-sm text-red-700 mb-4">
          Something went wrong. Please try refreshing the page.
        </p>
        {error && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
              Error Details
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

/**
 * Application-level Error Fallback
 */
function ApplicationErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="shrink-0">
            <svg className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-medium text-gray-900">Application Error</h1>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-6">
            We&apos;re sorry, but something went wrong with the application. Our team has been notified.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Page-level Error Fallback
 */
function PageErrorFallback({ pageName }: { pageName?: string }) {
  return (
    <div className="min-h-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          {pageName ? `${pageName} Error` : 'Page Error'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          This page encountered an error. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

/**
 * Component-level Error Fallback
 */
function ComponentErrorFallback({ componentName }: { componentName: string }) {
  return (
    <div className="component-error p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center">
        <div className="shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-800">
            <strong>{componentName}</strong> component failed to load.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for handling async errors in functional components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    workflowErrorLogger.logError(error, {
      hook: 'useErrorHandler',
      componentStack: errorInfo?.componentStack,
    });

    // Could show toast notification or other UI feedback
    console.error('Async error caught:', error);
  };
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}