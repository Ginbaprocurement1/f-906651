import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImportStockDialog } from "@/components/stock/ImportStockDialog";
import { useState } from "react";

const SupplierStock = () => {
  const navigate = useNavigate();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [userSupplierId, setUserSupplierId] = useState<number | null>(null);

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

  // Fetch warehouses for the supplier
  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['supplierWarehouses', userSupplierId],
    queryFn: async () => {
      if (!userSupplierId) return [];
      const { data, error } = await supabase
        .from('master_suppliers_locations')
        .select('*')
        .eq('supplier_id', userSupplierId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userSupplierId,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-3xl font-bold">Mi stock</h1>
            </div>
            <Button onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Actualizar stock desde plantilla
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {warehouses?.map((warehouse) => (
                <div
                  key={warehouse.pickup_location_id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/stock/${warehouse.pickup_location_id}`)}
                >
                  <img
                    src={warehouse.pickup_location_image || '/placeholder.svg'}
                    alt={warehouse.location_name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{warehouse.location_name}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      
      {userSupplierId && (
        <ImportStockDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          supplierId={userSupplierId}
        />
      )}
    </div>
  );
};

export default SupplierStock;