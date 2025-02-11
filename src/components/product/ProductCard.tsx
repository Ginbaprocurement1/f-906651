
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/useCartStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StockTable } from "./StockTable";
import { useWorkCenterStore } from "@/stores/useWorkCenterStore";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  userRole?: string;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: number) => void;
}

export const ProductCard = ({ product, userRole, onEdit, onDelete }: ProductCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const { selectedLocation } = useWorkCenterStore();

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  const handleQuantityAdjust = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setButtonRef(event.currentTarget);
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    setIsDialogOpen(false);
    await addToCart(product, quantity);
    toast({
      title: "Añadido al carrito",
      description: `${quantity} ${quantity === 1 ? "unidad" : "unidades"} añadidas al carrito.`,
    });
    setQuantity(1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node) && buttonRef && !buttonRef.contains(event.target as Node)) {
        setIsDialogOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [buttonRef]);

  const handleProductClick = (event: React.MouseEvent) => {
    const isAccordionClick = (event.target as HTMLElement).closest('[data-accordion-component]');
    if (
      buttonRef?.contains(event.target as Node) ||
      dialogRef.current?.contains(event.target as Node) ||
      isAccordionClick
    ) {
      return;
    }
    navigate(`/productos/${product.product_id}`);
  };

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!product.product_id) return;

    try {
      const { error } = await supabase
        .from('master_product')
        .delete()
        .eq('product_id', product.product_id);

      if (error) throw error;

      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
      });
      
      onDelete?.(product.product_id);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el producto",
      });
    }
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit?.(product);
  };

  const { data: deliveryInfo } = useQuery({
    queryKey: ["delivery-info", product.product_id, selectedLocation?.delivery_location_id],
    enabled: !!selectedLocation && userRole === 'Client',
    queryFn: async () => {
      if (!selectedLocation) return { deliveryDays: "-", pickupTime: "-" };

      // Get stock locations and distances
      const { data: stockData } = await supabase
        .from('supplier_stock')
        .select(`
          quantity,
          location_id,
          master_suppliers_locations!inner (
            province_id
          )
        `)
        .eq('product_id', product.product_id)
        .gt('quantity', 0);

      if (!stockData?.length) return { deliveryDays: "-", pickupTime: "-" };

      // Get distances for each stock location
      const stockWithDistances = await Promise.all(
        stockData.map(async (stock) => {
          const { data: distanceData } = await supabase
            .from('delivery_province_distance')
            .select('distance_km')
            .or(`and(province_id_A.eq.${selectedLocation.province_id},province_id_B.eq.${stock.master_suppliers_locations.province_id}),and(province_id_A.eq.${stock.master_suppliers_locations.province_id},province_id_B.eq.${selectedLocation.province_id})`)
            .maybeSingle();

          return {
            ...stock,
            distance: distanceData?.distance_km || Infinity
          };
        })
      );

      // Sort by distance and ensure we have a valid nearest location
      stockWithDistances.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      const nearestStock = stockWithDistances[0];

      if (!nearestStock) return { deliveryDays: "-", pickupTime: "-" };

      // Get delivery time using the nearest location's province
      let deliveryDays = "-";
      if (product.supplier_id) {
        const { data: deliveryTimes } = await supabase
          .from('delivery_times')
          .select('delivery_days')
          .eq('supplier_id', product.supplier_id)
          .or(`and(province_id_a.eq.${selectedLocation.province_id},province_id_b.eq.${nearestStock.master_suppliers_locations.province_id}),and(province_id_a.eq.${nearestStock.master_suppliers_locations.province_id},province_id_b.eq.${selectedLocation.province_id})`)
          .maybeSingle();
        
        deliveryDays = deliveryTimes?.delivery_days || "-";
      }

      // Get pickup time only for locations in the same province
      let pickupTime = "-";
      
      // Get pickup locations in the same province as the selected location
      const { data: pickupLocations } = await supabase
        .from('master_suppliers_locations')
        .select('pickup_location_id')
        .eq('province_id', selectedLocation.province_id);

      if (pickupLocations?.length) {
        const locationIds = pickupLocations.map(loc => loc.pickup_location_id);
        
        // Check stock at these locations and sort by quantity
        const { data: sameProvinceStock } = await supabase
          .from('supplier_stock')
          .select(`
            location_id,
            quantity
          `)
          .eq('product_id', product.product_id)
          .gt('quantity', 0)
          .in('location_id', locationIds)
          .order('quantity', { ascending: false });

        if (sameProvinceStock?.length) {
          // Use the location with the highest stock
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
    }
  });

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col relative cursor-pointer" 
      onClick={handleProductClick}
    >
      <div className="relative aspect-square bg-muted">
        <img
          src={product.product_image_url || "/placeholder.svg"}
          alt={product.product_name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-secondary">
          {product.product_name}
        </h3>
        <div className="space-y-1 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-1">
            <span className="font-medium">Manufacturer:</span> {product.manufacturer || "N/A"}
          </p>
          <p className="text-lg font-semibold mt-2 text-secondary">
            {product.price_without_vat?.toFixed(2)} € / {product.product_uom || "unit"}
          </p>
          {userRole === 'Client' && (
            <div className="text-sm text-gray-600 mt-2">
              <p>Tiempo de entrega: {deliveryInfo?.deliveryDays}</p>
              <p>Tiempo de recogida: {deliveryInfo?.pickupTime}</p>
            </div>
          )}
          <Accordion type="single" collapsible className="w-full" data-accordion-component>
            <AccordionItem value="stock">
              <AccordionTrigger className="text-sm py-2">Stock</AccordionTrigger>
              <AccordionContent>
                <StockTable 
                  productId={product.product_id} 
                  supplierName={product.supplier_name}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="mt-4 relative">
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
            <Button className="w-full group hover:bg-secondary" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Añadir a carrito
            </Button>
          )}

          {isDialogOpen && buttonRef && (
            <div
              ref={dialogRef}
              className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-[240px]"
              style={{
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <div
                className="absolute w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-gray-200"
                style={{
                  bottom: "-8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              ></div>

              <h3 className="text-center font-medium mb-3">
                Cantidad
              </h3>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityAdjust(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-16 text-center"
                    min="1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityAdjust(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-base font-semibold">
                    {(product.price_without_vat * quantity).toFixed(2)} € sin IVA
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(product.price_with_vat * quantity).toFixed(2)} € IVA
                  </p>
                </div>

                <div className="flex justify-center space-x-3">
                  <Button variant="default" className="bg-primary text-white" onClick={handleConfirm}>
                    Confirmar
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
