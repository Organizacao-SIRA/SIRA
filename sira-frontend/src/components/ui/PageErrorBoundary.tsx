import React from 'react';

interface PageErrorBoundaryProps {
  resetKey: string;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface PageErrorBoundaryState {
  hasError: boolean;
}

export class PageErrorBoundary extends React.Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  state: PageErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PageErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Erro ao renderizar a página:', error, info);
  }

  componentDidUpdate(prevProps: PageErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
