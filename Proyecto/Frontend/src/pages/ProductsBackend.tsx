import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import heisenbergLogo from "@/assets/heisenberg-logo.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Package, ArrowLeft, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services";
import { Product, CreateProductRequest } from "@/types/product.types";

const ProductsBackend = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newProduct, setNewProduct] = useState<CreateProductRequest>({
    name: "",
    type: "",
    use_case: "",
    warnings: "",
    contraindications: "",
    expiration_date: "",
    price: 0,
    stock: 0,
  });

  useEffect(() => {
    checkAuth();
    loadProducts();
  }, []);

  const checkAuth = () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      toast({
        title: "Acceso Denegado",
        description: "Debes iniciar sesión para acceder a esta página.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar productos';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadProducts();
      return;
    }

    try {
      setSearching(true);
      const results = await productService.searchProductsByName(searchTerm);
      setProducts(results);
      
      if (results.length === 0) {
        toast({
          title: "Sin resultados",
          description: `No se encontraron productos con "${searchTerm}"`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al buscar productos';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.type ||
      !newProduct.use_case ||
      !newProduct.expiration_date ||
      newProduct.price <= 0 ||
      newProduct.stock < 0
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos correctamente",
        variant: "destructive",
      });
      return;
    }

    try {
      const createdProduct = await productService.createProduct(newProduct);
      setProducts([...products, createdProduct]);
      setNewProduct({
        name: "",
        type: "",
        use_case: "",
        warnings: "",
        contraindications: "",
        expiration_date: "",
        price: 0,
        stock: 0,
      });
      setDialogOpen(false);
      toast({
        title: "Producto agregado",
        description: `${createdProduct.name} ha sido agregado exitosamente`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear producto';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast({
        title: "Producto eliminado",
        description: `${name} ha sido eliminado`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar producto';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-foreground">Cargando productos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/chat")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={heisenbergLogo} alt="Heisenberg" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Heisenberg</h1>
              <p className="text-sm text-primary">Sistema de Gestión de Productos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary/60">Backend Conectado</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header con búsqueda */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Gestión de Productos
            </h2>
            <p className="text-muted-foreground">
              Total de productos: {products.length}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Barra de búsqueda */}
            <div className="flex gap-2 flex-1 md:w-64">
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-input border-border/50"
              />
              <Button
                onClick={handleSearch}
                disabled={searching}
                variant="outline"
                size="icon"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
              {searchTerm && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    loadProducts();
                  }}
                  variant="ghost"
                >
                  Limpiar
                </Button>
              )}
            </div>

            {/* Botón agregar producto */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg">
                  <Plus className="h-5 w-5" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Nuevo Producto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Producto *</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        placeholder="Ej: Acetaminofén 500mg"
                        className="bg-input border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <Input
                        id="type"
                        value={newProduct.type}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, type: e.target.value })
                        }
                        placeholder="Ej: Analgésico"
                        className="bg-input border-border/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="use_case">Caso de Uso *</Label>
                    <Input
                      id="use_case"
                      value={newProduct.use_case}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, use_case: e.target.value })
                      }
                      placeholder="Para qué se utiliza"
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warnings">Advertencias</Label>
                    <Input
                      id="warnings"
                      value={newProduct.warnings}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, warnings: e.target.value })
                      }
                      placeholder="Advertencias de uso"
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contraindications">Contraindicaciones</Label>
                    <Input
                      id="contraindications"
                      value={newProduct.contraindications}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          contraindications: e.target.value,
                        })
                      }
                      placeholder="Contraindicaciones"
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiration_date">Fecha de Expiración *</Label>
                      <Input
                        id="expiration_date"
                        type="date"
                        value={newProduct.expiration_date}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            expiration_date: e.target.value,
                          })
                        }
                        className="bg-input border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="5000"
                        className="bg-input border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            stock: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="100"
                        className="bg-input border-border/50"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddProduct}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Agregar Producto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="gradient-card border border-border/50 p-6 hover:shadow-glow transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">
                        ¿Eliminar producto?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        ¿Estás seguro de que deseas eliminar "{product.name}"? Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-card border-border">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                {product.name}
              </h3>
              <p className="text-primary text-sm mb-1">{product.type}</p>
              <p className="text-muted-foreground text-xs mb-4 line-clamp-2">
                {product.use_case}
              </p>

              <div className="border-t border-border/50 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Precio:</span>
                  <span className="text-primary font-semibold">
                    ${product.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Stock:</span>
                  <span className="text-primary font-semibold">
                    {product.stock} unidades
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Expira:</span>
                  <span className="text-xs text-muted-foreground">
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
                : "Agrega tu primer producto para comenzar"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsBackend;
