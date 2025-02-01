import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useCartStore } from "@/stores/useCartStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Star, StarHalf } from "lucide-react";

const ProductDetail = () => {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_product")
        .select("*")
        .eq("product_id", parseInt(productId as string))
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", parseInt(productId as string))
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La cantidad debe ser un número entero positivo",
      });
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    await addToCart(product, quantity);
    toast({
      title: "Añadido al carrito",
      description: `${quantity} ${quantity === 1 ? "unidad" : "unidades"} añadidas al carrito.`,
    });
    setQuantity(1);
  };

  if (isLoadingProduct || isLoadingReviews) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto mt-32 mb-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto mt-32 mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Producto no encontrado
            </h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative aspect-square">
            <img
              src={product.product_image_url || "/placeholder.svg"}
              alt={product.product_name}
              className="w-60 h-60 object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {product.product_name}
            </h1>

            {product.manufacturer_logo && (
              <img
                src={product.manufacturer_logo}
                alt="Manufacturer logo"
                className="h-12 object-contain"
              />
            )}

            <div className="space-y-2">
              <p className="text-lg text-gray-600">
                Proveedor: {product.supplier_name}
              </p>
              {product.ref_supplier && (
                <p className="text-sm text-gray-500">
                  Ref: {product.ref_supplier}
                </p>
              )}
            </div>

            <div className="text-xl font-semibold">
              {product.price_without_vat} €/{product.product_uom}{" "}
              <span className="text-gray-500 text-base">
                (con IVA {product.price_with_vat} €/{product.product_uom})
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(String(Math.max(1, quantity - 1)))}
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-20 text-center"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(String(quantity + 1))}
              >
                +
              </Button>
            </div>

            <Button onClick={handleAddToCart} className="w-full">
              Añadir al carrito
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger>Descripción</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600">{product.product_description}</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reviews">
              <AccordionTrigger>Opiniones</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {reviews?.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay opiniones todavía
                    </p>
                  ) : (
                    reviews?.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                          <span className="font-medium">{review.reviewer_name}</span>
                          <span className="text-gray-500 text-sm">
                            {format(new Date(review.created_at), "PPP", {
                              locale: es,
                            })}
                          </span>
                        </div>
                        <p className="text-gray-600">{review.review_text}</p>
                      </div>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
