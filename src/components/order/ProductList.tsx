
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
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProductListProps {
  items: CartItem[];
  deliveryDates?: {
    cart_item_id: number;
    total_delivery_days: number | null;
    pickup_time_limit: string | null;
  }[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

export const ProductList = ({ items, deliveryDates, onUpdateQuantity, onRemoveItem }: ProductListProps) => {
  const navigate = useNavigate();
  
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="products">
        <AccordionTrigger>
          Mis productos
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {items.map((item) => {
              const deliveryInfo = deliveryDates?.find(date => date.cart_item_id === item.id);
              
              let deliveryTimeText = "";
              if (item.delivery_method === "Envío" && deliveryInfo?.total_delivery_days) {
                const days = deliveryInfo.total_delivery_days;
                const today = new Date();
                const deliveryDate = new Date(today.setDate(today.getDate() + days));
                deliveryTimeText = `Fecha de entrega: ${format(deliveryDate, "d 'de' MMMM", { locale: es })}`;
              } else if (item.delivery_method === "Recogida" && deliveryInfo?.pickup_time_limit) {
                const now = new Date();
                const timeLimit = new Date(now.toDateString() + ' ' + deliveryInfo.pickup_time_limit);
                const isAfterTimeLimit = now > timeLimit;
                const pickupDate = isAfterTimeLimit ? 
                  new Date(now.setDate(now.getDate() + 1)) : 
                  now;
                deliveryTimeText = `Fecha de recogida: ${format(pickupDate, "d 'de' MMMM", { locale: es })}`;
              }

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
                      {deliveryTimeText && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>{deliveryTimeText}</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 w-48">
                      <p className="text-sm font-semibold mb-2">Stock Disponible</p>
                      <StockTable 
                        productId={item.product_id} 
                        supplierName={item.supplier_name}
                        className="border rounded-lg"
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
