import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CartItem } from "@/types/order";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductListProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

export const ProductList = ({ items, onUpdateQuantity, onRemoveItem }: ProductListProps) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="products">
        <AccordionTrigger>
          Mis productos
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-4">
                  {item.product_image_url && (
                    <img 
                      src={item.product_image_url} 
                      alt={item.product_name} 
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-bold">{item.product_name}</p>
                    <p className="text-sm text-gray-500">Ref: {item.ref_supplier}</p>
                    <p className="font-bold mt-1">
                      {item.price_without_vat?.toFixed(2)} €/{item.product_uom} sin IVA
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};