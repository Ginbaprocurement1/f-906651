
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

  const { data: deliveryTimes } = useQuery({
    queryKey: ['delivery-times', items.map(item => ({
      id: item.id,
      delivery_location_id: item.delivery_location_id,
      pickup_location_id: item.pickup_location_id
    }))],
    enabled: items.length > 0,
    queryFn: async () => {
      const deliveryTimes: Record<number, { deliveryDate: string; pickupDate: string }> = {};

      for (const item of items) {
        try {
          if (item.delivery_method === "Envío" && item.delivery_location_id) {
            // Get client location province
            const { data: clientLocation } = await supabase
              .from('master_client_locations')
              .select('province_id')
              .eq('delivery_location_id', item.delivery_location_id)
              .single();

            if (!clientLocation) continue;

            // Get supplier locations with stock
            const { data: stockLocations } = await supabase
              .from('supplier_stock')
              .select(`
                quantity,
                location_id,
                master_suppliers_locations!inner (
                  pickup_location_id,
                  province_id
                )
              `)
              .eq('product_id', item.product_id)
              .gt('quantity', 0);

            if (!stockLocations?.length) {
              deliveryTimes[item.id] = { deliveryDate: "-", pickupDate: "-" };
              continue;
            }

            // Find the closest supplier location to the client
            let closestLocation = null;
            let minDistance = Infinity;

            for (const location of stockLocations) {
              // Check both directions in delivery_province_distance
              const { data: distanceData } = await supabase
                .from('delivery_province_distance')
                .select('distance_km')
                .or(`and(province_id_A.eq.${clientLocation.province_id},province_id_B.eq.${location.master_suppliers_locations.province_id}),and(province_id_A.eq.${location.master_suppliers_locations.province_id},province_id_B.eq.${clientLocation.province_id})`)
                .maybeSingle();

              if (distanceData && distanceData.distance_km < minDistance) {
                minDistance = distanceData.distance_km;
                closestLocation = location;
              }
            }

            if (!closestLocation) {
              deliveryTimes[item.id] = { deliveryDate: "-", pickupDate: "-" };
              continue;
            }

            // Get delivery time from the closest location
            const { data: deliveryTime } = await supabase
              .from('delivery_times')
              .select('delivery_days')
              .or(`and(province_id_a.eq.${clientLocation.province_id},province_id_b.eq.${closestLocation.master_suppliers_locations.province_id}),and(province_id_a.eq.${closestLocation.master_suppliers_locations.province_id},province_id_b.eq.${clientLocation.province_id})`)
              .maybeSingle();

            deliveryTimes[item.id] = { 
              deliveryDate: deliveryTime?.delivery_days || "-", 
              pickupDate: "-" 
            };

          } else if (item.delivery_method === "Recogida" && item.pickup_location_id) {
            // Get pickup location details and check stock
            const { data: stockInLocation } = await supabase
              .from('supplier_stock')
              .select('quantity')
              .eq('product_id', item.product_id)
              .eq('location_id', item.pickup_location_id)
              .gt('quantity', 0)
              .maybeSingle();

            if (!stockInLocation) {
              deliveryTimes[item.id] = { deliveryDate: "-", pickupDate: "-" };
              continue;
            }

            // Get pickup time limit
            const { data: pickupTime } = await supabase
              .from('pickup_times')
              .select('time_limit')
              .eq('pickup_location_id', item.pickup_location_id)
              .maybeSingle();

            if (!pickupTime?.time_limit) {
              deliveryTimes[item.id] = { deliveryDate: "-", pickupDate: "-" };
              continue;
            }

            // Compare with current time in Spain
            const now = new Date();
            const spainTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
            const timeLimit = new Date(spainTime.toDateString() + ' ' + pickupTime.time_limit);
            const pickupDate = spainTime > timeLimit ? "Mañana" : "Hoy";

            deliveryTimes[item.id] = { deliveryDate: "-", pickupDate };
          }
        } catch (error) {
          console.error('Error calculating delivery times:', error);
          deliveryTimes[item.id] = { deliveryDate: "-", pickupDate: "-" };
        }
      }

      return deliveryTimes;
    }
  });
  
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="products">
        <AccordionTrigger>
          Mis productos
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {items.map((item) => {
              const deliveryInfo = deliveryTimes?.[item.id] || { deliveryDate: "-", pickupDate: "-" };
              
              return (
                <div 
                  key={item.id} 
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex gap-4 flex-1">
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
                        {item.delivery_method === "Envío" && (
                          <p>Fecha de entrega: {deliveryInfo.deliveryDate}</p>
                        )}
                        {item.delivery_method === "Recogida" && (
                          <p>Fecha de recogida: {deliveryInfo.pickupDate}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-start gap-4 w-1/3 min-w-[250px]">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Stock Disponible</p>
                      <StockTable 
                        productId={item.product_id} 
                        supplierName={item.supplier_name}
                        className="border rounded-lg w-full"
                      />
                    </div>
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
