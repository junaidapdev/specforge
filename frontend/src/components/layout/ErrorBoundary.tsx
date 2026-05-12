import type { ErrorInfo, ReactNode } from 'react';
import { Component, Fragment } from 'react';

import { logger } from '@/lib/logger';

import { ErrorFallback } from './ErrorFallback';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  resetKey: number;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
    resetKey: 0,
  };

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    logger.error('react_error_boundary', {
      message: error.message,
      stack: error.stack,
    });
  }

  private handleReset = (): void => {
    this.setState((state) => ({
      hasError: false,
      resetKey: state.resetKey + 1,
    }));
  };

  override render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }

    return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
  }
}
