import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import heisenbergLogo from "@/assets/heisenberg-logo.png";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-glow">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <AlertCircle className="w-16 h-16 text-destructive" />
          </div>

          {/* Error Code */}
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          
          {/* Error Message */}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Página No Encontrada
          </h2>
          
          <p className="text-muted-foreground mb-4">
            Lo sentimos, la página que buscas en <span className="text-primary font-semibold">Heisenberg</span> no existe.
          </p>

          {/* Requested Path */}
          <div className="bg-muted/20 border border-border/30 rounded-lg p-3 mb-6">
            <p className="text-sm text-muted-foreground">
              Ruta solicitada: <span className="font-mono text-foreground">{location.pathname}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => navigate("/chat")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Ir al Chat
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full font-semibold"
            >
              Ir a Inicio
            </Button>
          </div>

          {/* Logo */}
          <div className="mt-8 flex justify-center">
            <img src={heisenbergLogo} alt="Heisenberg" className="w-16 h-16 opacity-50" />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          © 2025 Heisenberg Bot. Si crees que esto es un error, contacta con soporte.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
