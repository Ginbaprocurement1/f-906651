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

export const ProductList = ({ items, onUpdateQuantity, onRemoveItem }: ProductListProps) => {
  const navigate = useNavigate();
  
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="products">
        <AccordionTrigger>
          Mis productos
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
              >
                
                {/* Imagen y detalles del producto */}
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

                    {/* Controles de cantidad */}
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

                    {/* Precios */}
                    <div className="mt-2">
                      <p className="text-sm font-semibold">
                        {item.price_without_vat}€ sin IVA
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.price_with_vat}€ con IVA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nueva columna: Stock + tiempos de entrega */}
                <div className="flex flex-col ml-6 w-1/3 min-w-[200px]">
                  {/* Tabla de Stock */}
                  <div className="mb-2">
                    <p className="text-sm font-semibold">Stock Disponible</p>
                    <StockTable 
                      productId={item.product_id} 
                      supplierName={item.supplier_name}
                      className="border rounded-lg w-full"
                    />
                  </div>

                  {/* Tiempos de entrega y recogida */}
                  <div className="text-sm text-gray-500">
                    <p>Entrega: {item.deliveryTime || "No disponible"}</p>
                    <p>Recogida: {item.pickupTime || "No disponible"}</p>
                  </div>
                </div>

                {/* Botón de eliminar */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  onClick={() => onRemoveItem(item.id)}
                >
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
