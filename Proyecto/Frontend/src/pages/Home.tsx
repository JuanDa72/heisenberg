import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heisenbergLogo from "@/assets/heisenberg-logo.png";
import { MessageCircle, Package, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { User } from "@/types/user.types";
import type { Product } from "@/types/product.types";
import { productService } from "@/services";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      toast({
        title: "Sesión requerida",
        description: "Por favor inicia sesión para continuar.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    try {
      const userData: User = JSON.parse(savedUser);
      setUser(userData);
    } catch {
      localStorage.removeItem("user");
      navigate("/");
    }
  }, [navigate, toast]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data.slice(0, 10));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al cargar productos";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    loadProducts();
  }, [toast]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-blue-700/60
 flex flex-col">
      <div className="relative w-full max-w-6xl mx-auto flex-1 flex flex-col gap-12">
        <div className="absolute top-0 left-0">
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-card/80 border-border/60 hover:bg-card"
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              <UserIcon className="h-5 w-5" />
            </Button>
            {profileMenuOpen && (
              <div className="absolute mt-2 w-40 rounded-lg bg-card border border-border/60 shadow-glow z-20">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  Configuración de perfil
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => {
                    localStorage.removeItem("user");
                    setProfileMenuOpen(false);
                    toast({
                      title: "Sesión cerrada",
                      description: "Has cerrado sesión exitosamente.",
                    });
                    navigate("/");
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="pt-16 md:pt-24 pb-4 flex flex-col md:flex-row items-center md:items-center gap-10">
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
            <img
              src={heisenbergLogo}
              alt="Heisenberg"
              className="w-24 h-24 mb-4"
            />
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-primary mb-3">
              HEISENBERG
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg mb-4 max-w-xl">
              Tu asistente virtual para droguerías: consulta medicamentos, resuelve
              dudas rápidas y descubre productos disponibles en tu inventario.
            </p>
            {user && (
              <p className="text-foreground text-base mb-4">
                Bienvenido, <span className="font-semibold">{user.username}</span>
              </p>
            )}

            <Button
              className="mt-2 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-sm md:text-base font-semibold rounded-full shadow-md"
              onClick={() => navigate("/chat")}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Abrir asistente</span>
            </Button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs md:text-sm text-primary/80 mb-2 uppercase tracking-wide">
              Experiencia asistida
            </p>
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
              Heisenberg se conecta con tu base de datos de productos para darte
              respuestas rápidas y contextuales sobre medicamentos, advertencias y
              disponibilidad. Todo en una sola interfaz sencilla.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4 flex-1 pb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                Productos destacados
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Explora tus productos uno a uno.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 text-xs md:text-sm"
              onClick={() => navigate("/catalogo")}
            >
              <Package className="h-4 w-4" />
              Ver catálogo
            </Button>
          </div>

          <div className="relative mt-4 flex items-center justify-center">
            {products.length === 0 ? (
              <Card className="w-full max-w-xl bg-card/80 border-border/40 p-6 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">
                  No hay productos para mostrar todavía. Agrega productos en la
                  sección de gestión para verlos aquí.
                </p>
              </Card>
            ) : (
              <div className="w-full max-w-2xl flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hidden sm:flex"
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === 0 ? products.length - 1 : prev - 1
                    )
                  }
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Card className="flex-1 bg-card/80 border-border/40 p-6">
                  {products[currentIndex] && (
                    <>
                      <h3 className="text-lg md:text-2xl font-semibold text-foreground mb-1">
                        {products[currentIndex].name}
                      </h3>
                      <p className="text-sm text-primary mb-2">
                        {products[currentIndex].type}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {products[currentIndex].use_case}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Precio</span>
                          <span className="text-primary font-semibold">
                            ${products[currentIndex].price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Stock</span>
                          <span className="text-primary font-semibold">
                            {products[currentIndex].stock} unidades
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-4">
                        Usa las flechas para ver otros productos o entra al catálogo para
                        ver el listado completo.
                      </p>
                    </>
                  )}
                </Card>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hidden sm:flex"
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === products.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4 pb-10">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">
              ¿Qué puedes preguntar a Heisenberg?
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Usa el asistente para consultar disponibilidad, usos, advertencias y precios
              de medicamentos. También puedes pedir recomendaciones según síntomas y
              verificar interacciones básicas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/80 border-border/40 p-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-primary/80">
                Ejemplo 1
              </p>
              <div className="space-y-2">
                <div className="rounded-2xl bg-accent/20 px-3 py-2 text-sm text-foreground max-w-[90%]">
                  <span className="font-semibold">Usuario:</span> ¿Tienen acetaminofén de
                  500mg disponible y cuánto cuesta?
                </div>
                <div className="rounded-2xl bg-card px-3 py-2 text-sm text-muted-foreground border border-border/40 max-w-[95%]">
                  <span className="font-semibold text-primary">Heisenberg:</span> Sí, tengo
                  registrado "Acetaminofén 500mg". El precio actual es de $5.000 y hay 30
                  unidades disponibles en inventario.
                </div>
              </div>
            </Card>

            <Card className="bg-card/80 border-border/40 p-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-primary/80">
                Ejemplo 2
              </p>
              <div className="space-y-2">
                <div className="rounded-2xl bg-accent/20 px-3 py-2 text-sm text-foreground max-w-[90%]">
                  <span className="font-semibold">Usuario:</span> Necesito un medicamento
                  para el dolor de cabeza leve, ¿qué me recomiendas?
                </div>
                <div className="rounded-2xl bg-card px-3 py-2 text-sm text-muted-foreground border border-border/40 max-w-[95%]">
                  <span className="font-semibold text-primary">Heisenberg:</span> Para dolor
                  de cabeza leve puedo sugerir analgésicos como acetaminofén o ibuprofeno.
                  Recuerda siempre seguir las indicaciones del empaque y, si el dolor
                  persiste, consultar a tu médico.
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
