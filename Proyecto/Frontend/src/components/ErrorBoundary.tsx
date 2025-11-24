import { ReactNode, Component, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component para capturar errores en el árbol de componentes
 * y mostrar una UI amigable en lugar de un crash
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center gradient-hero px-4">
          <div className="w-full max-w-md">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-glow">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <AlertCircle className="w-16 h-16 text-destructive" />
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
                Oops! Algo salió mal
              </h1>

              {/* Error Description */}
              <p className="text-muted-foreground text-center mb-4">
                Lo sentimos, la aplicación encontró un error inesperado.
              </p>

              {/* Error Details */}
              {this.state.error && (
                <div className="bg-muted/20 border border-destructive/30 rounded-lg p-3 mb-6">
                  <p className="text-xs text-muted-foreground font-mono break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full font-semibold"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir a Inicio
                </Button>
              </div>

              {/* Support Message */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                Si el problema persiste, por favor contacta con soporte
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
