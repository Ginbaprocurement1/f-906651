import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

interface ProductListProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

const fetchDeliveryInfo = async (items) => {
  return Promise.all(
    items.map(async (item) => {
      let deliveryDays = "No disponible";
      let pickupTime = "No disponible";

      try {
        if (item.delivery_method === "Envío" && item.delivery_location_id) {
          const { data: locationData } = await supabase
            .from("master_client_locations")
            .select("province_id")
            .eq("delivery_location_id", item.delivery_location_id)
            .maybeSingle();

          if (locationData) {
            const destinationProvinceId = locationData.province_id;
            
            const { data: stockLocations } = await supabase
              .from("supplier_stock")
              .select("quantity, location_id, master_suppliers_locations(province_id)")
              .eq("product_id", item.product_id)
              .gt("quantity", 0);

            if (stockLocations?.length) {
              const closestLocation = stockLocations.find(
                (stock) => stock.master_suppliers_locations.province_id === destinationProvinceId
              );

              if (closestLocation) {
                const { data: deliveryTimeData } = await supabase
                  .from("delivery_times")
                  .select("delivery_days")
                  .eq("supplier_id", item.supplier_id)
                  .eq("province_id_a", destinationProvinceId)
                  .eq("province_id_b", destinationProvinceId)
                  .maybeSingle();

                if (deliveryTimeData) {
                  deliveryDays = `${deliveryTimeData.delivery_days} días`;
                }
              }
            }
          }
        } else if (item.delivery_method === "Recogida" && item.pickup_location_id) {
          const { data: pickupData } = await supabase
            .from("pickup_times")
            .select("time_limit")
            .eq("pickup_location_id", item.pickup_location_id)
            .maybeSingle();

          if (pickupData?.time_limit) {
            const now = new Date();
            const timeLimit = new Date(`${now.toDateString()} ${pickupData.time_limit}`);
            pickupTime = now > timeLimit ? "Mañana" : "Hoy";
          }
        }
      } catch (error) {
        console.error("Error fetching delivery info:", error);
      }

      return { ...item, deliveryTime: deliveryDays, pickupTime };
    })
  );
};

export const ProductList = ({ items, onUpdateQuantity, onRemoveItem }: ProductListProps) => {
  const [updatedItems, setUpdatedItems] = useState(items);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveryInfo(items).then(setUpdatedItems);
  }, [items]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="products">
        <AccordionTrigger>Mis productos</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {updatedItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
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
                    <p className="font-bold cursor-pointer hover:text-primary" onClick={() => navigate(`/productos/${item.product_id}`)}>
                      {item.product_name}
                    </p>
                    <p className="text-sm text-gray-500">{item.supplier_name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}>-
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+
                      </Button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-semibold">{item.price_without_vat}€ sin IVA</p>
                      <p className="text-xs text-gray-500">{item.price_with_vat}€ con IVA</p>
                    </div>
                    <p>Tiempo de Entrega: {item.deliveryTime}</p>
                    <p>Tiempo de Recogida: {item.pickupTime}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2" onClick={() => onRemoveItem(item.id)}>
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
