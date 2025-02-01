import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "@/hooks/use-toast";

interface ImportStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StockTemplate {
  product_name: string;
  location_name: string;
  quantity: number;
}

export const ImportStockDialog = ({ 
  open, 
  onOpenChange,
}: ImportStockDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleDownload = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: userDetails } = await supabase
        .from('master_user')
        .select('supplier_id')
        .eq('id', userData.user.id)
        .single();

      if (!userDetails?.supplier_id) return;

      const { data: stockData } = await supabase
        .from('supplier_stock')
        .select(`
          quantity,
          product:master_product(product_name),
          location:master_suppliers_locations(location_name)
        `)
        .eq('supplier_id', userDetails.supplier_id);

      if (!stockData || stockData.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontró stock para descargar",
        });
        return;
      }

      const templateData = stockData.map(item => ({
        product_name: item.product.product_name,
        location_name: item.location.location_name,
        quantity: item.quantity
      }));

      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stock");
      XLSX.writeFile(wb, "stock_template.xlsx");

      toast({
        title: "Éxito",
        description: "Plantilla descargada correctamente",
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar la plantilla",
      });
    }
  };

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setIsUploading(true);
    const errors: string[] = [];

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuario no autenticado");

      const { data: userDetails } = await supabase
        .from('master_user')
        .select('supplier_id')
        .eq('id', userData.user.id)
        .single();

      if (!userDetails?.supplier_id) throw new Error("Proveedor no encontrado");

      // Get existing stock for this supplier
      const { data: existingStock } = await supabase
        .from('supplier_stock')
        .select(`
          stock_id,
          product:master_product(product_name),
          location:master_suppliers_locations(location_name)
        `)
        .eq('supplier_id', userDetails.supplier_id);

      const existingStockMap = new Map(
        existingStock?.map(item => [
          `${item.product.product_name}-${item.location.location_name}`,
          item.stock_id
        ]) || []
      );

      const uploadedStockKeys = new Set();

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as StockTemplate[];

      // Process each row in the Excel file
      for (const row of jsonData) {
        try {
          if (!row.product_name || !row.location_name) {
            errors.push(`Hay una fila sin producto o ubicación`);
            continue;
          }

          if (row.quantity < 0) {
            errors.push(`La cantidad debe ser positiva para ${row.product_name}`);
            continue;
          }

          const stockKey = `${row.product_name}-${row.location_name}`;
          uploadedStockKeys.add(stockKey);

          // Get product_id and location_id
          const { data: product } = await supabase
            .from('master_product')
            .select('product_id')
            .eq('product_name', row.product_name)
            .eq('supplier_name', (await supabase
              .from('master_suppliers_company')
              .select('supplier_name')
              .eq('supplier_id', userDetails.supplier_id)
              .single()).data?.supplier_name)
            .single();

          const { data: location } = await supabase
            .from('master_suppliers_locations')
            .select('pickup_location_id')
            .eq('location_name', row.location_name)
            .eq('supplier_id', userDetails.supplier_id)
            .single();

          if (!product || !location) {
            errors.push(`No se encontró el producto ${row.product_name} o la ubicación ${row.location_name}`);
            continue;
          }

          const stockData = {
            supplier_id: userDetails.supplier_id,
            product_id: product.product_id,
            location_id: location.pickup_location_id,
            quantity: row.quantity
          };

          const existingStockId = existingStockMap.get(stockKey);

          if (existingStockId) {
            if (row.quantity === 0) {
              // Delete if quantity is 0
              await supabase
                .from('supplier_stock')
                .delete()
                .eq('stock_id', existingStockId);
            } else {
              // Update existing stock
              await supabase
                .from('supplier_stock')
                .update(stockData)
                .eq('stock_id', existingStockId);
            }
          } else if (row.quantity > 0) {
            // Insert new stock
            await supabase
              .from('supplier_stock')
              .insert([stockData]);
          }
        } catch (rowError) {
          errors.push(`Error procesando la fila: ${rowError.message}`);
        }
      }

      // Delete stock entries that are not in the uploaded file
      for (const [key, stockId] of existingStockMap.entries()) {
        if (!uploadedStockKeys.has(key)) {
          await supabase
            .from('supplier_stock')
            .delete()
            .eq('stock_id', stockId);
        }
      }

      if (errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Errores durante la actualización",
          description: (
            <div className="mt-2 space-y-2">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          ),
        });
      } else {
        toast({
          title: "Éxito",
          description: "Stock actualizado correctamente",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar el archivo",
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar stock desde plantilla</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Descarga la plantilla con tu stock actual, modifícala y súbela de nuevo para actualizar tu stock.
              El nombre del producto y la ubicación son los identificadores únicos de cada línea.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Button onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Descargar plantilla
            </Button>
            <div className="relative">
              <Button 
                variant="outline" 
                className="w-full"
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Subiendo...' : 'Subir plantilla actualizada'}
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".xlsx,.xls"
                  onChange={handleUpload}
                  disabled={isUploading}
                />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};