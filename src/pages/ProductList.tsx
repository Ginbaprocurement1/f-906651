import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProductFilters } from "@/components/ProductFilters";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Upload } from "lucide-react";
import { ProductFormDialog } from "@/components/product/ProductFormDialog";

interface Product {
  product_id: number;
  product_name: string;
  product_image_url: string;
  manufacturer: string;
  supplier_name: string;
  price_without_vat: number;
  price_with_vat: number;
  product_uom: string;
  product_category_l1: string;
  stock_demand_category: string;
  product_description: string;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const searchFromUrl = searchParams.get('search');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('master_user')
          .select('user_role, supplier_id')
          .eq('id', user.id)
          .single();
        setUserRole(userData?.user_role || null);
        setSupplierName(userData?.supplier_id ? userData.supplier_id : null);
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from('master_user')
        .select('user_role, supplier_id')
        .eq('id', user.id)
        .single();

      let query = supabase.from('master_product').select('*');

      // If user is a supplier, only show their products
      if (userData?.user_role === 'Supplier') {
        const { data: supplierData } = await supabase
          .from('master_suppliers_company')
          .select('supplier_name')
          .eq('supplier_id', userData.supplier_id)
          .single();

        if (supplierData) {
          query = query.eq('supplier_name', supplierData.supplier_name);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load products. Please try again later.",
        });
        return;
      }

      if (data) {
        setProducts(data);
        let filtered = data;

        if (categoryFromUrl) {
          filtered = filtered.filter(product => 
            product.product_category_l1 === categoryFromUrl
          );
        }

        if (searchFromUrl) {
          const keywords = searchFromUrl.toLowerCase().split(/[\s-]+/);
          filtered = filtered.filter(product => {
            const searchText = `${product.product_name} ${product.product_description}`.toLowerCase();
            return keywords.every(keyword => searchText.includes(keyword));
          });
        }

        setFilteredProducts(filtered);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, [categoryFromUrl, searchFromUrl]);

  const handleFilterChange = (filters: {
    categories: string[];
    priceRange: number[];
    manufacturers: string[];
    suppliers: string[];
    availability: string[];
  }) => {
    let filtered = products;

    // If there's a search term, apply it first
    if (searchFromUrl) {
      const keywords = searchFromUrl.toLowerCase().split(/[\s-]+/);
      filtered = filtered.filter(product => {
        const searchText = `${product.product_name} ${product.product_description}`.toLowerCase();
        return keywords.every(keyword => searchText.includes(keyword));
      });
    }

    // Apply category filter from URL or filter selection
    if (categoryFromUrl) {
      filtered = filtered.filter(product => 
        product.product_category_l1 === categoryFromUrl
      );
    } else if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.product_category_l1)
      );
    }

    // Apply other filters
    filtered = filtered.filter(product => 
      product.price_without_vat >= filters.priceRange[0] &&
      product.price_without_vat <= filters.priceRange[1]
    );

    if (filters.manufacturers.length > 0) {
      filtered = filtered.filter(product => 
        filters.manufacturers.includes(product.manufacturer)
      );
    }

    if (filters.suppliers.length > 0) {
      filtered = filtered.filter(product => 
        filters.suppliers.includes(product.supplier_name)
      );
    }

    if (filters.availability.length > 0) {
      filtered = filtered.filter(product => 
        filters.availability.includes(product.stock_demand_category)
      );
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <div className="mb-8">
          {userRole === 'Supplier' && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <Button onClick={() => setShowProductForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir nuevo producto
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar catálogo desde plantilla
                </Button>
              </div>
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          )}
          <h1 className="text-3xl font-bold">
            {searchFromUrl ? "Búsqueda de productos" : (categoryFromUrl || (userRole === 'Supplier' ? "Mis Productos" : "Nuestros productos"))}
          </h1>
          <p className="text-muted-foreground mt-2">
            {userRole === 'Supplier' 
              ? "Gestiona tu catálogo de productos"
              : "Browse through our extensive collection of construction materials"}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <ProductFilters onFilterChange={handleFilterChange} />
          </div>
          
          <div className="col-span-9">
            <ProductGrid products={filteredProducts} isLoading={isLoading} />
          </div>
        </div>
      </main>
      <Footer />

      {userRole === 'Supplier' && supplierName && (
        <ProductFormDialog
          open={showProductForm}
          onOpenChange={setShowProductForm}
          supplierName={supplierName}
          onSuccess={() => {
            // Refresh products after successful creation
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

export default ProductList;
