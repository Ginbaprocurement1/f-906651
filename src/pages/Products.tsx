import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

const Products = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_product')
        .select('*');
      
      if (error) throw error;
      return data as Product[];
    }
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-32">
        <ProductGrid 
          products={products || []} 
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Products;