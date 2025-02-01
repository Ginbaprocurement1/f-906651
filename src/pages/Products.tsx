import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/product/ProductGrid";

const Products = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-32">
        <ProductGrid />
      </main>
    </div>
  );
};

export default Products;