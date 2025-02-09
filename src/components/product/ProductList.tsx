
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
import { ImportCatalogDialog } from "@/components/product/ImportCatalogDialog";
import { Product } from "@/types/product";
import { WorkCenterSelect } from "@/components/WorkCenterSelect";

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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const navigate = useNavigate();

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

    let query = supabase
      .from('master_product')
      .select('*, master_suppliers_company!inner(supplier_id)');

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
      // Transform the data to match the Product interface
      const transformedData: Product[] = data.map(item => ({
        ...item,
        supplier_id: item.master_suppliers_company.supplier_id
      }));

      setProducts(transformedData);
      let filtered = transformedData;

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

        if (userData?.supplier_id) {
          const { data: supplierData } = await supabase
            .from('master_suppliers_company')
            .select('supplier_name')
            .eq('supplier_id', userData.supplier_id)
            .single();
          
          setSupplierName(supplierData?.supplier_name || null);
        }
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryFromUrl, searchFromUrl]);

  const handleFilterChange = (filters: any) => {
    let filtered = products;
    
    if (filters.categories?.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.product_category_l1)
      );
    }

    if (filters.search) {
      const keywords = filters.search.toLowerCase().split(/[\s-]+/);
      filtered = filtered.filter(product => {
        const searchText = `${product.product_name} ${product.product_description}`.toLowerCase();
        return keywords.every(keyword => searchText.includes(keyword));
      });
    }

    setFilteredProducts(filtered);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.product_id !== productId));
    setFilteredProducts(prev => prev.filter(p => p.product_id !== productId));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {userRole === 'Supplier' ? (
              <>
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <h1 className="text-3xl font-bold text-left">
                  {searchFromUrl ? "Búsqueda de productos" : (categoryFromUrl || "Mis Productos")}
                </h1>
                <div className="flex gap-4">
                  <Button onClick={() => {
                    setProductToEdit(null);
                    setShowProductForm(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir nuevo producto
                  </Button>
                  <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar catálogo desde plantilla
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold">
                  {searchFromUrl ? "Búsqueda de productos" : (categoryFromUrl || "Productos")}
                </h1>
                {userRole === 'Client' && <WorkCenterSelect />}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <ProductFilters onFilterChange={handleFilterChange} />
          </div>
          
          <div className="col-span-9">
            <ProductGrid 
              products={filteredProducts} 
              isLoading={isLoading}
              userRole={userRole || undefined}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        </div>
      </main>
      <Footer />

      {userRole === 'Supplier' && supplierName && (
        <>
          <ProductFormDialog
            open={showProductForm}
            onOpenChange={setShowProductForm}
            supplierName={supplierName}
            onSuccess={fetchProducts}
            productToEdit={productToEdit}
          />
          <ImportCatalogDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
            supplierName={supplierName}
            onSuccess={fetchProducts}
          />
        </>
      )}
    </div>
  );
};

export default ProductList;
