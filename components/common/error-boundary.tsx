'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log del error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Callback personalizado si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto con estilo brutalista
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_black] max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={3} />
              <h1 className="text-2xl font-black uppercase tracking-tight">
                ¡Oops! Algo salió mal
              </h1>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-bold border-l-4 border-black pl-3">
                Ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al inicio.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-100 border-2 border-black p-3">
                  <summary className="font-bold cursor-pointer uppercase text-xs">
                    Detalles del error (desarrollo)
                  </summary>
                  <pre className="text-xs mt-2 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-blue-400 hover:bg-blue-500 border-4 border-black shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-150 px-4 py-2 font-black uppercase text-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" strokeWidth={3} />
                  Reintentar
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-green-400 hover:bg-green-500 border-4 border-black shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-150 px-4 py-2 font-black uppercase text-sm flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" strokeWidth={3} />
                  Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar Error Boundary de forma funcional
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}