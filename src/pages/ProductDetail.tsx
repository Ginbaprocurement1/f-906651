import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useCartStore } from "@/stores/useCartStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Star, StarHalf, ArrowLeft } from "lucide-react";
import { StockTable } from "@/components/product/StockTable";
import { ProductFormDialog } from "@/components/product/ProductFormDialog";
import { WorkCenterSelect } from "@/components/WorkCenterSelect";
import { useWorkCenterStore } from "@/stores/useWorkCenterStore";

const ProductDetail = () => {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [supplierName, setSupplierName] = useState<string | null>(null);
  const { selectedLocation } = useWorkCenterStore();

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_product")
        .select("*, master_suppliers_company!inner(supplier_id)")
        .eq("product_id", parseInt(productId as string))
        .single();

      if (error) throw error;
      return {
        ...data,
        supplier_id: data.master_suppliers_company.supplier_id
      };
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

  useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
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
      return null;
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

  const handleDelete = async () => {
    if (!product?.product_id) return;

    try {
      // First, delete any cart items referencing this product
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', product.product_id);

      if (cartError) throw cartError;

      // Then delete the product
      const { error } = await supabase
        .from('master_product')
        .delete()
        .eq('product_id', product.product_id);

      if (error) throw error;

      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
      });
      
      navigate(-1);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el producto",
      });
    }
  };

  const handleEdit = () => {
    if (!product) return;
    setShowProductForm(true);
  };

  const { data: deliveryInfo } = useQuery({
    queryKey: ["delivery-info", productId, selectedLocation?.delivery_location_id],
    enabled: !!selectedLocation && userRole === 'Client',
    queryFn: async () => {
      if (!selectedLocation) return { deliveryDays: "-", pickupTime: "-" };

      try {
        // Step 1: Get destination province_id from master_client_locations
        const { data: locationData, error: locationError } = await supabase
          .from('master_client_locations')
          .select('province_id')
          .eq('delivery_location_id', selectedLocation.delivery_location_id)
          .single();

        if (locationError || !locationData) {
          console.error('Error getting destination province:', locationError);
          return { deliveryDays: "-", pickupTime: "-" };
        }

        const destinationProvinceId = locationData.province_id;

        // Calculate Delivery Time
        let deliveryDays = "-";

        // Step 2: Get all stock locations with their distances
        const { data: stockLocations, error: stockError } = await supabase
          .from('supplier_stock')
          .select(`
            quantity,
            location_id,
            master_suppliers_locations!inner (
              province_id
            )
          `)
          .eq('product_id', parseInt(productId as string))
          .gt('quantity', 0);

        if (!stockError && stockLocations?.length) {
          // First check if there's stock in the same province
          const sameProvinceLocation = stockLocations.find(
            location => location.master_suppliers_locations.province_id === destinationProvinceId
          );

          if (sameProvinceLocation && product?.supplier_id) {
            // If there's stock in the same province, use that location
            const sourceProvinceId = destinationProvinceId;

            // Get delivery time for same province
            const { data: deliveryTimeData } = await supabase
              .from('delivery_times')
              .select('delivery_days')
              .eq('supplier_id', product.supplier_id)
              .eq('province_id_a', sourceProvinceId)
              .eq('province_id_b', destinationProvinceId)
              .maybeSingle();

            if (deliveryTimeData?.delivery_days) {
              deliveryDays = deliveryTimeData.delivery_days;
            }
          }

          // If no delivery time found for same province, proceed with distance calculation
          if (deliveryDays === "-") {
            const locationsWithDistances = await Promise.all(
              stockLocations.map(async (stock) => {
                const { data: distanceData } = await supabase
                  .from('delivery_province_distance')
                  .select('distance_km')
                  .or(`and(province_id_A.eq.${destinationProvinceId},province_id_B.eq.${stock.master_suppliers_locations.province_id}),and(province_id_A.eq.${stock.master_suppliers_locations.province_id},province_id_B.eq.${destinationProvinceId})`)
                  .maybeSingle();

                return {
                  ...stock,
                  distance: distanceData?.distance_km || Infinity
                };
              })
            );

            // Sort locations by distance
            locationsWithDistances.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

            // Get the province_id of the closest location
            const closestLocation = locationsWithDistances[0];
            if (closestLocation && product?.supplier_id) {
              const sourceProvinceId = closestLocation.master_suppliers_locations.province_id;

              const { data: deliveryTimeData } = await supabase
                .from('delivery_times')
                .select('delivery_days')
                .eq('supplier_id', product.supplier_id)
                .or(`and(province_id_a.eq.${destinationProvinceId},province_id_b.eq.${sourceProvinceId}),and(province_id_a.eq.${sourceProvinceId},province_id_b.eq.${destinationProvinceId})`)
                .maybeSingle();

              deliveryDays = deliveryTimeData?.delivery_days || "-";
            }
          }
        }

        // Calculate Pickup Time (independent of delivery time)
        let pickupTime = "-";
        
        const { data: pickupLocations } = await supabase
          .from('master_suppliers_locations')
          .select('pickup_location_id')
          .eq('province_id', destinationProvinceId);

        if (pickupLocations?.length) {
          const locationIds = pickupLocations.map(loc => loc.pickup_location_id);
          
          const { data: sameProvinceStock } = await supabase
            .from('supplier_stock')
            .select(`
              location_id,
              quantity
            `)
            .eq('product_id', parseInt(productId as string))
            .gt('quantity', 0)
            .in('location_id', locationIds)
            .order('quantity', { ascending: false });

          if (sameProvinceStock?.length) {
            const bestLocation = sameProvinceStock[0];
            const { data: pickupTimeData } = await supabase
              .from('pickup_times')
              .select('time_limit')
              .eq('pickup_location_id', bestLocation.location_id)
              .maybeSingle();

            if (pickupTimeData?.time_limit) {
              const now = new Date();
              const timeLimit = new Date(now.toDateString() + ' ' + pickupTimeData.time_limit);
              pickupTime = now > timeLimit ? "Mañana" : "Hoy";
            }
          }
        }

        return {
          deliveryDays,
          pickupTime
        };
      } catch (error) {
        console.error('Error calculating delivery info:', error);
        return { deliveryDays: "-", pickupTime: "-" };
      }
    }
  });

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
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          {userRole === 'Client' && <WorkCenterSelect />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative aspect-square">
            <img
              src={product?.product_image_url || "/placeholder.svg"}
              alt={product?.product_name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {product?.product_name}
            </h1>

            {product?.manufacturer_logo && (
              <img
                src={product.manufacturer_logo}
                alt="Manufacturer logo"
                className="h-12 object-contain"
              />
            )}

            <div className="space-y-2">
              <p className="text-lg text-gray-600">
                Proveedor: {product?.supplier_name}
              </p>
              {product?.ref_supplier && (
                <p className="text-sm text-gray-500">
                  Ref: {product.ref_supplier}
                </p>
              )}
            </div>

            <div className="text-xl font-semibold">
              {product?.price_without_vat} €/{product?.product_uom}{" "}
              <span className="text-gray-500 text-base">
                (con IVA {product?.price_with_vat} €/{product?.product_uom})
              </span>
            </div>

            {userRole === 'Supplier' ? (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleEdit}>
                  Modificar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                  Eliminar
                </Button>
              </div>
            ) : (
              <>
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
              </>
            )}
        {userRole === 'Client' && (
          <div className="text-sm text-gray-600 mt-4">
            <p>Tiempo de entrega: {deliveryInfo?.deliveryDays}</p>
            <p>Tiempo de recogida: {deliveryInfo?.pickupTime}</p>
          </div>
        )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Stock Disponible</h3>
              <StockTable 
                productId={parseInt(productId as string)} 
                supplierName={product?.supplier_name}
                className="border rounded-lg"
              />
            </div>
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

      {userRole === 'Supplier' && supplierName && (
        <ProductFormDialog
          open={showProductForm}
          onOpenChange={setShowProductForm}
          supplierName={supplierName}
          onSuccess={() => {
            setShowProductForm(false);
            // Refresh the product data
            window.location.reload();
          }}
          productToEdit={product}
        />
      )}
    </div>
  );
};

export default ProductDetail;
