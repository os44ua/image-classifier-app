import { Component, type ErrorInfo, type ReactNode } from 'react';
import logger from '../services/logger';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Обновляем состояние, чтобы при следующем рендере показать fallback
    // refrescamos el estado para el siguiente render mostrar fallback
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // logging de errror
    logger.error(`Error capturado por ErrorBoundary: ${error.message}`);
    logger.debug(`Detalles del error: ${info.componentStack}`);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
