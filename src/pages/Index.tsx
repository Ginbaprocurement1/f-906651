import { ShoppingCart } from "lucide-react";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductVariants } from "@/components/ProductVariants";
import { ReviewStars } from "@/components/ReviewStars";
import { RelatedProducts } from "@/components/RelatedProducts";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MOCK_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    alt: "Product image 1",
  },
  {
    url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    alt: "Product image 2",
  },
  {
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
    alt: "Product image 3",
  },
];

const MOCK_VARIANTS = [
  {
    name: "Size",
    values: ["S", "M", "L", "XL"],
  },
  {
    name: "Color",
    values: ["Black", "White", "Navy", "Gray"],
  },
];

const MOCK_RELATED = [
  {
    id: "1",
    name: "Similar Product 1",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  },
  {
    id: "2",
    name: "Similar Product 2",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
  },
  {
    id: "3",
    name: "Similar Product 3",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
  },
  {
    id: "4",
    name: "Similar Product 4",
    price: 109.99,
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
  },
];

const Index = () => {
  const { toast } = useToast();

  const handleVariantChange = (variant: string, value: string) => {
    console.log(`Selected ${variant}: ${value}`);
  };

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: "This product has been added to your cart.",
    });
  };

  return (
    <div className="min-h-screen bg-product-background">
      <main className="container py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left column - Gallery */}
          <ProductGallery images={MOCK_IMAGES} />

          {/* Right column - Product details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-product-text">
                Premium Laptop Stand
              </h1>
              <p className="text-2xl font-semibold text-product-text mt-2">
                $149.99
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ReviewStars rating={4} />
              <span className="text-sm text-product-muted">
                (128 reviews)
              </span>
            </div>

            <p className="text-product-muted leading-relaxed">
              Elevate your workspace with our premium laptop stand. Crafted from
              high-grade aluminum, it provides optimal viewing angles and improves
              posture. Perfect for both home office and professional settings.
            </p>

            <ProductVariants
              variants={MOCK_VARIANTS}
              onVariantChange={handleVariantChange}
            />

            <Button
              onClick={handleAddToCart}
              className="w-full bg-primary hover:bg-primary-hover"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-product-text mb-4">
                Product Details
              </h2>
              <ul className="space-y-2 text-product-muted">
                <li>• Adjustable height settings</li>
                <li>• Compatible with all laptop sizes</li>
                <li>• Built-in cable management</li>
                <li>• Non-slip surface</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-product-text mb-6">
            You might also like
          </h2>
          <RelatedProducts products={MOCK_RELATED} />
        </section>
      </main>
    </div>
  );
};

export default Index;