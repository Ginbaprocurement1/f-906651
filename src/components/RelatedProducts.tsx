import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface RelatedProductsProps {
  products: Product[];
}

export const RelatedProducts = ({ products }: RelatedProductsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => scroll("left")}
          className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-4 -mx-4"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-64 group cursor-pointer"
          >
            <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="font-medium text-product-text group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-product-muted">
              ${product.price.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => scroll("right")}
          className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};