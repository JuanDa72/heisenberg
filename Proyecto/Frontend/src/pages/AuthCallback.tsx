import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (!token) {
        toast({
          title: "Error",
          description: "Token de autenticación no encontrado.",
          variant: "destructive",
        });
        navigate("/", { replace: true });
        return;
      }

      try {
        // Guardar el token JWT
        localStorage.setItem("authToken", token);

        // Decodificar el payload del JWT (Base64URL) para obtener el email
        const parts = token.split(".");
        if (parts.length < 2) {
          throw new Error("Token inválido");
        }

        const payloadBase64 = parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        const padded = payloadBase64 + "=".repeat((4 - (payloadBase64.length % 4)) % 4);
        const payloadJson = atob(padded);
        const payload = JSON.parse(payloadJson) as { 
          id?: number;
          email?: string;
          role?: string;
        };

        if (!payload.email) {
          throw new Error("No se encontró el email en el token");
        }

        // Obtener el usuario completo del backend
        const user = await authService.getUserByEmail(payload.email);

        // Guardar usuario en localStorage
        localStorage.setItem("user", JSON.stringify(user));

        toast({
          title: "Autenticación exitosa",
          description: `Bienvenido ${user.username}!`,
        });

        navigate("/chat", { replace: true });
      } catch (error) {
        console.error("Error en callback de Google:", error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        
        toast({
          title: "Error de autenticación",
          description: `No se pudo completar el inicio de sesión: ${errorMessage}`,
          variant: "destructive",
        });
        
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
      }
    };

    void handleCallback();
  }, [location.search, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-foreground mb-4">Completando autenticación...</div>
        <div className="animate-spin w-8 h-8 border-4 border-primary border-transparent rounded-full"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
