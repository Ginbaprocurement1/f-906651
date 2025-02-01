import { ProductCard } from "./ProductCard";
import { Product } from "@/types/product";

export interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  userRole?: string;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: number) => void;
}

export const ProductGrid = ({ 
  products = [], // Provide default empty array
  isLoading,
  userRole,
  onEditProduct,
  onDeleteProduct 
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-muted"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
              <div className="h-8 bg-muted rounded w-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.product_id} 
          product={product}
          userRole={userRole}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
        />
      ))}
    </div>
  );
};