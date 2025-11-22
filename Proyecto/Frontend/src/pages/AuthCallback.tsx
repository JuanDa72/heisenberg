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
        navigate("/", { replace: true });
        return;
      }

      try {
        // Guardamos el token para futuras llamadas si se necesita
        localStorage.setItem("token", token);

        // Decodificar el payload del JWT (Base64URL)
        const parts = token.split(".");
        if (parts.length < 2) {
          throw new Error("Token inválido");
        }

        const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = payloadBase64.padEnd(payloadBase64.length + (4 - (payloadBase64.length % 4)) % 4, "=");
        const payloadJson = atob(padded);
        const payload = JSON.parse(payloadJson) as { email?: string };

        if (!payload.email) {
          throw new Error("No se encontró el email en el token");
        }

        // Obtener el usuario real desde el backend para mantener el mismo formato que el login normal
        const user = await authService.getUserByEmail(payload.email);

        localStorage.setItem("user", JSON.stringify(user));

        navigate("/chat");
      } catch (error) {
        console.error("Error en callback de Google:", error);
        toast({
          title: "Error de autenticación",
          description: "No se pudo completar el inicio de sesión con Google.",
          variant: "destructive",
        });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
      }
    };

    void handleCallback();
  }, [location.search, navigate, toast]);

  return null;
};

export default AuthCallback;
