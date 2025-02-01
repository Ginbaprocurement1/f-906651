import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImportStockDialog } from "@/components/stock/ImportStockDialog";

interface Warehouse {
  pickup_location_id: number;
  location_name: string;
  pickup_location_image: string | null;
}

export const SupplierStock = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: userDetails } = await supabase
        .from('master_user')
        .select('supplier_id')
        .eq('id', userData.user.id)
        .single();

      if (!userDetails?.supplier_id) return;

      const { data: warehousesData } = await supabase
        .from('master_suppliers_locations')
        .select('pickup_location_id, location_name, pickup_location_image')
        .eq('supplier_id', userDetails.supplier_id);

      if (warehousesData) {
        setWarehouses(warehousesData);
      }
    };

    fetchWarehouses();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Mi stock</h1>
        </div>
        <Button onClick={() => setIsImportDialogOpen(true)}>
          Actualizar stock desde plantilla
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <div
            key={warehouse.pickup_location_id}
            onClick={() => navigate(`/stock/${warehouse.pickup_location_id}`)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video relative">
              <img
                src={warehouse.pickup_location_image || '/placeholder.svg'}
                alt={warehouse.location_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{warehouse.location_name}</h3>
            </div>
          </div>
        ))}
      </div>

      <ImportStockDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
};