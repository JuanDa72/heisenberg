import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Package, ArrowLeft, Search, Loader2 } from "lucide-react";
import heisenbergLogo from "@/assets/heisenberg-logo.png";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services";
import { Product } from "@/types/product.types";

const Catalog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  const sortByExpirationDate = (items: Product[]) => {
    return [...items].sort((a, b) => {
      if (!a.expiration_date) return 1;
      if (!b.expiration_date) return -1;
      return a.expiration_date.localeCompare(b.expiration_date);
    });
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(sortByExpirationDate(data));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al cargar productos";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadProducts();
      return;
    }

    try {
      setSearching(true);
      const results = await productService.searchProductsByName(searchTerm);
      setProducts(sortByExpirationDate(results));

      if (results.length === 0) {
        toast({
          title: "Sin resultados",
          description: `No se encontraron productos con "${searchTerm}"`,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al buscar productos";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const [datePart] = dateString.split("T");
    const [yearStr, monthStr, dayStr] = datePart.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (!year || !month || !day) return dateString;

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-foreground">Cargando catálogo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={heisenbergLogo}
              alt="Heisenberg"
              className="h-8 w-8 rounded-lg shadow-md"
            />
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Catálogo de Productos
              </h1>
              <p className="text-xs text-muted-foreground">
                Consulta los productos disponibles en este momento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <section className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Productos</h2>
            <p className="text-sm text-muted-foreground">
              Búsqueda y visualización de productos disponibles.
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder="Buscar por nombre"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="bg-input border-border/50"
            />
            <Button
              variant="outline"
              onClick={handleSearch}
              disabled={searching}
              className="gap-2 min-w-[120px]"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>
        </section>

        <section>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="p-4 bg-card/60 border-border/60 flex flex-col justify-between h-full"
              >
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {product.name}
                  </h3>
                  <p className="text-primary text-xs mb-1">{product.type}</p>
                  <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
                    {product.use_case}
                  </p>
                </div>

                <div className="border-t border-border/50 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio:</span>
                    <span className="text-primary font-semibold">
                      ${product.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="text-primary font-semibold">
                      {product.stock} unidades
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Expira:</span>
                    <span className="text-muted-foreground">
                      {formatDate(product.expiration_date)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No hay productos
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron productos con ese nombre"
                  : "Actualmente no hay productos disponibles"}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Catalog;
