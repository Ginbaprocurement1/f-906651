import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface StockItem {
  stock_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
}

interface Warehouse {
  location_name: string;
  pickup_location_image: string | null;
}

export const WarehouseStock = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [modified, setModified] = useState(false);
  const [originalStock, setOriginalStock] = useState<StockItem[]>([]);

  useEffect(() => {
    const fetchWarehouseAndStock = async () => {
      if (!id) return;

      const locationId = parseInt(id, 10);
      if (isNaN(locationId)) return;

      // Fetch warehouse details
      const { data: warehouseData } = await supabase
        .from('master_suppliers_locations')
        .select('location_name, pickup_location_image')
        .eq('pickup_location_id', locationId)
        .single();

      if (warehouseData) {
        setWarehouse(warehouseData);
      }

      // Fetch stock with product names
      const { data: stockData } = await supabase
        .from('supplier_stock')
        .select(`
          stock_id,
          product_id,
          quantity,
          product:master_product(product_name)
        `)
        .eq('location_id', locationId);

      if (stockData) {
        const formattedStock = stockData.map(item => ({
          stock_id: item.stock_id,
          product_id: item.product_id,
          product_name: item.product.product_name,
          quantity: item.quantity || 0
        }));
        setStock(formattedStock);
        setOriginalStock(formattedStock);
      }
    };

    fetchWarehouseAndStock();
  }, [id]);

  const handleQuantityChange = (stockId: string, newValue: string) => {
    const quantity = parseFloat(newValue);
    
    if (isNaN(quantity) || quantity < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La cantidad debe ser un número positivo",
      });
      return;
    }

    const newStock = stock.map(item => 
      item.stock_id === stockId ? { ...item, quantity } : item
    );
    
    setStock(newStock);
    setModified(true);
  };

  const handleSave = async () => {
    if (!id) return;
    const locationId = parseInt(id, 10);
    if (isNaN(locationId)) return;

    try {
      for (const item of stock) {
        const originalItem = originalStock.find(i => i.stock_id === item.stock_id);
        
        if (originalItem?.quantity !== item.quantity) {
          if (item.quantity === 0) {
            // Delete if quantity is 0
            await supabase
              .from('supplier_stock')
              .delete()
              .eq('stock_id', item.stock_id);
          } else {
            // Update quantity
            await supabase
              .from('supplier_stock')
              .update({ quantity: item.quantity })
              .eq('stock_id', item.stock_id);
          }
        }
      }

      toast({
        title: "Éxito",
        description: "Stock actualizado correctamente",
      });
      
      setModified(false);
      
      // Refresh stock data
      const { data: stockData } = await supabase
        .from('supplier_stock')
        .select(`
          stock_id,
          product_id,
          quantity,
          product:master_product(product_name)
        `)
        .eq('location_id', locationId);

      if (stockData) {
        const formattedStock = stockData.map(item => ({
          stock_id: item.stock_id,
          product_id: item.product_id,
          product_name: item.product.product_name,
          quantity: item.quantity || 0
        }));
        setStock(formattedStock);
        setOriginalStock(formattedStock);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el stock",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-start gap-6 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {warehouse?.pickup_location_image && (
          <img
            src={warehouse.pickup_location_image}
            alt={warehouse.location_name}
            className="w-32 h-32 object-cover rounded-lg"
          />
        )}
        
        <h1 className="text-2xl font-bold mt-2">
          {warehouse?.location_name}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stock.map((item) => (
              <tr key={item.stock_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.product_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.stock_id, e.target.value)}
                    min="0"
                    step="1"
                    className="w-32"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modified && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>
            Guardar
          </Button>
        </div>
      )}
    </div>
  );
};