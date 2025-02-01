import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { AddProductDialog } from "@/components/stock/AddProductDialog";

interface StockItem {
  stock_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  modified?: boolean;
}

const WarehouseStock = () => {
  const navigate = useNavigate();
  const { warehouseId } = useParams();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [userSupplierId, setUserSupplierId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch supplier ID for the current user
  useQuery({
    queryKey: ['currentUserSupplier'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('master_user')
          .select('supplier_id')
          .eq('id', user.id)
          .single();
        if (userData?.supplier_id) {
          setUserSupplierId(userData.supplier_id);
          return userData.supplier_id;
        }
      }
      return null;
    },
  });

  const { data: warehouse } = useQuery({
    queryKey: ['warehouse', warehouseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_suppliers_locations')
        .select('*')
        .eq('pickup_location_id', parseInt(warehouseId!, 10))
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stockData } = useQuery({
    queryKey: ['warehouseStock', warehouseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_stock')
        .select(`
          *,
          master_product (
            product_name
          )
        `)
        .eq('location_id', parseInt(warehouseId!, 10));
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (stockData) {
      setStockItems(stockData.map(item => ({
        stock_id: item.stock_id,
        product_id: item.product_id,
        product_name: item.master_product.product_name,
        quantity: item.quantity,
      })));
    }
  }, [stockData]);

  const updateStockMutation = useMutation({
    mutationFn: async (items: StockItem[]) => {
      const promises = items.map(async (item) => {
        if (!item.modified) return;

        if (item.quantity === 0) {
          // Delete item if quantity is 0
          const { error } = await supabase
            .from('supplier_stock')
            .delete()
            .eq('stock_id', item.stock_id);
          if (error) throw error;
        } else {
          // Update quantity
          const { error } = await supabase
            .from('supplier_stock')
            .update({ quantity: item.quantity })
            .eq('stock_id', item.stock_id);
          if (error) throw error;
        }
      });

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouseStock'] });
      setHasChanges(false);
      toast({
        title: "Stock actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los cambios. Por favor, inténtalo de nuevo.",
      });
    },
  });

  const handleQuantityChange = (stockId: string, value: string) => {
    const quantity = parseFloat(value);
    if (isNaN(quantity) || quantity < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La cantidad debe ser un número positivo.",
      });
      return;
    }

    setStockItems(prev => prev.map(item => 
      item.stock_id === stockId 
        ? { ...item, quantity, modified: true }
        : item
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateStockMutation.mutate(stockItems);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex items-start gap-6">
              <img
                src={warehouse?.pickup_location_image || '/placeholder.svg'}
                alt={warehouse?.location_name}
                className="w-48 h-48 object-cover rounded-lg"
              />
              <div>
                <h1 className="text-3xl font-bold mb-2">{warehouse?.location_name}</h1>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir producto
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Producto</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stockItems.map((item) => (
                  <tr key={item.stock_id}>
                    <td className="px-6 py-4">{item.product_name}</td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.stock_id, e.target.value)}
                        className="w-32 text-right"
                        min="0"
                        step="1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasChanges && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSave}>
                Guardar
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      
      {userSupplierId && warehouseId && (
        <AddProductDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          supplierId={userSupplierId}
          warehouseId={parseInt(warehouseId, 10)}
        />
      )}
    </div>
  );
};

export default WarehouseStock;