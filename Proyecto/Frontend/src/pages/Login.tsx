import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heisenbergLogo from "@/assets/heisenberg-logo.png";
import { User, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services";
import type { CreateUserDTO } from "@/types/user.types";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    window.location.href = `${baseUrl}/users/auth/google`;
  };

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      navigate("/chat");
    }
  }, [navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Registro de nuevo usuario
        if (!displayName.trim()) {
          toast({
            title: "Error",
            description: "Por favor ingresa tu nombre de usuario.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const newUser: CreateUserDTO = {
          username: displayName,
          email,
          password,
          role: 'user', // Rol por defecto
        };

        await authService.createUser(newUser);

        toast({
          title: "Registro exitoso",
          description: "Por favor inicia sesión con tus credenciales.",
        });
        
        setIsSignUp(false);
        setEmail("");
        setPassword("");
        setDisplayName("");
      } else {
        // Login
        const user = await authService.login(email, password);
        
        // Guardar el usuario en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido ${user.username}!`,
        });
        
        navigate("/chat");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error durante la autenticación.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4">
      <div className="w-full max-w-md">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-glow">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src={heisenbergLogo} alt="Heisenberg" className="w-24 h-24 mb-4" />
            <h1 className="text-3xl font-bold tracking-wider text-primary">
              HEISENBERG
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Asistente Virtual de Droguería
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground">
                  Nombre de Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Tu nombre"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 bg-input border-border/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Correo Electrónico
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border/50 focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-input border-border/50 focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                isSignUp ? "Registrarse" : "Iniciar Sesión"
              )}
            </Button>

            {!isSignUp && (
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full mt-2 font-semibold"
                disabled={loading}
              >
                Iniciar sesión con Google
              </Button>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
                disabled={loading}
              >
                {isSignUp ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          © 2025 Heisenberg Bot. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
