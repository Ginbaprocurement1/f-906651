
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CartItem } from "@/types/order";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { StockTable } from "@/components/product/StockTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductListProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

export const ProductList = ({ items, onUpdateQuantity, onRemoveItem }: ProductListProps) => {
  const navigate = useNavigate();

  // Group items by supplier
  const itemsBySupplier = items.reduce((acc, item) => {
    if (!acc[item.supplier_name]) {
      acc[item.supplier_name] = [];
    }
    acc[item.supplier_name].push(item);
    return acc;
  }, {} as { [key: string]: CartItem[] });
  
  const getDeliveryInfo = (item: CartItem) => {
    return useQuery({
      queryKey: ["delivery-info", item.product_id, item.delivery_location_id, item.pickup_location_id, item.delivery_method],
      enabled: !!item.delivery_location_id || !!item.pickup_location_id,
      queryFn: async () => {
        try {
          let provinceId = null;

          if (item.delivery_method === "Envío" && item.delivery_location_id) {
            // Get province_id from delivery location
            const { data: locationData } = await supabase
              .from('master_client_locations')
              .select('province_id')
              .eq('delivery_location_id', item.delivery_location_id)
              .maybeSingle();
            
            provinceId = locationData?.province_id;
          } else if (item.delivery_method === "Recogida" && item.pickup_location_id) {
            // Get province_id from pickup location
            const { data: locationData } = await supabase
              .from('master_suppliers_locations')
              .select('province_id')
              .eq('pickup_location_id', item.pickup_location_id)
              .maybeSingle();
            
            provinceId = locationData?.province_id;
          }

          if (!provinceId) {
            return { deliveryDays: "-", pickupTime: "-" };
          }

          // Get all stock locations with their distances
          const { data: stockLocations } = await supabase
            .from('supplier_stock')
            .select(`
              quantity,
              location_id,
              master_suppliers_locations!inner (
                province_id
              )
            `)
            .eq('product_id', item.product_id)
            .gt('quantity', 0);

          if (!stockLocations?.length) {
            return { deliveryDays: "-", pickupTime: "-" };
          }

          // First check if there's stock in the same province
          const sameProvinceLocation = stockLocations.find(
            location => location.master_suppliers_locations.province_id === provinceId
          );

          let deliveryDays = "-";
          if (sameProvinceLocation) {
            // Get delivery time for same province
            const { data: deliveryTimeData } = await supabase
              .from('delivery_times')
              .select('delivery_days')
              .eq('supplier_id', item.supplier_id)
              .eq('province_id_a', provinceId)
              .eq('province_id_b', provinceId)
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
                  .or(`and(province_id_A.eq.${provinceId},province_id_B.eq.${stock.master_suppliers_locations.province_id}),and(province_id_A.eq.${stock.master_suppliers_locations.province_id},province_id_B.eq.${provinceId})`)
                  .maybeSingle();

                return {
                  ...stock,
                  distance: distanceData?.distance_km || Infinity
                };
              })
            );

            locationsWithDistances.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

            const closestLocation = locationsWithDistances[0];
            if (closestLocation) {
              const sourceProvinceId = closestLocation.master_suppliers_locations.province_id;

              const { data: deliveryTimeData } = await supabase
                .from('delivery_times')
                .select('delivery_days')
                .eq('supplier_id', item.supplier_id)
                .or(`and(province_id_a.eq.${provinceId},province_id_b.eq.${sourceProvinceId}),and(province_id_a.eq.${sourceProvinceId},province_id_b.eq.${provinceId})`)
                .maybeSingle();

              deliveryDays = deliveryTimeData?.delivery_days || "-";
            }
          }

          // Calculate Pickup Time (independent)
          let pickupTime = "-";
          
          const { data: pickupLocations } = await supabase
            .from('master_suppliers_locations')
            .select('pickup_location_id')
            .eq('province_id', provinceId);

          if (pickupLocations?.length) {
            const locationIds = pickupLocations.map(loc => loc.pickup_location_id);
            
            const { data: sameProvinceStock } = await supabase
              .from('supplier_stock')
              .select(`
                location_id,
                quantity
              `)
              .eq('product_id', item.product_id)
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
  };
  
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="products">
        <AccordionTrigger>
          Mis productos
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {items.map((item) => {
              const { data: deliveryInfo } = getDeliveryInfo(item);
              
              return (
                <div key={item.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-4">
                    {item.product_image_url && (
                      <img 
                        src={item.product_image_url} 
                        alt={item.product_name} 
                        className="w-20 h-20 object-cover rounded cursor-pointer"
                        onClick={() => navigate(`/productos/${item.product_id}`)}
                      />
                    )}
                    <div className="flex-1">
                      <p 
                        className="font-bold cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/productos/${item.product_id}`)}
                      >
                        {item.product_name}
                      </p>
                      <p className="text-sm text-gray-500">{item.supplier_name}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-semibold">
                          {item.price_without_vat}€ sin IVA
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.price_with_vat}€ con IVA
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Tiempo de entrega: {deliveryInfo?.deliveryDays || "-"}</p>
                        <p>Tiempo de recogida: {deliveryInfo?.pickupTime || "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 w-48">
                    <p className="text-sm font-semibold mb-2">Stock Disponible</p>
                    <StockTable 
                      productId={item.product_id} 
                      supplierName={item.supplier_name}
                      className="border rounded-lg"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
