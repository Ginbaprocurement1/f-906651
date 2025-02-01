import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';

interface ImportStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: number;
}

export const ImportStockDialog = ({ open, onOpenChange, supplierId }: ImportStockDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const downloadTemplate = async () => {
    try {
      // Fetch current stock data
      const { data: stockData, error: stockError } = await supabase
        .from('supplier_stock')
        .select(`
          product_id,
          quantity,
          location_id,
          master_product (product_name),
          master_suppliers_locations (location_name)
        `)
        .eq('supplier_id', supplierId);

      if (stockError) throw stockError;

      // Transform data for Excel
      const excelData = stockData.map(item => ({
        'Nombre del producto': item.master_product.product_name,
        'Almacén': item.master_suppliers_locations.location_name,
        'Cantidad': item.quantity
      }));

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stock");

      // Download file
      XLSX.writeFile(wb, "plantilla_stock.xlsx");
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar la plantilla.",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Get current stock data for comparison
      const { data: currentStock, error: stockError } = await supabase
        .from('supplier_stock')
        .select(`
          stock_id,
          product_id,
          location_id,
          master_product (product_name),
          master_suppliers_locations (location_name)
        `)
        .eq('supplier_id', supplierId);

      if (stockError) throw stockError;

      // Process updates and deletions
      const updates: any[] = [];
      const currentStockMap = new Map(
        currentStock.map(item => [
          `${item.master_product.product_name}-${item.master_suppliers_locations.location_name}`,
          item
        ])
      );

      // Track which items are in the new data
      const processedItems = new Set<string>();

      // Process each row in the uploaded file
      for (const row of jsonData as any[]) {
        const key = `${row['Nombre del producto']}-${row['Almacén']}`;
        processedItems.add(key);

        const currentItem = currentStockMap.get(key);
        if (currentItem) {
          // Update existing item
          if (row['Cantidad'] === 0) {
            updates.push(
              supabase
                .from('supplier_stock')
                .delete()
                .eq('stock_id', currentItem.stock_id)
            );
          } else {
            updates.push(
              supabase
                .from('supplier_stock')
                .update({ quantity: row['Cantidad'] })
                .eq('stock_id', currentItem.stock_id)
            );
          }
        }
        // New items would need additional logic to get product_id and location_id
      }

      // Delete items that are not in the new data
      for (const [key, item] of currentStockMap) {
        if (!processedItems.has(key)) {
          updates.push(
            supabase
              .from('supplier_stock')
              .delete()
              .eq('stock_id', item.stock_id)
          );
        }
      }

      // Execute all updates
      await Promise.all(updates);

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['warehouseStock'] });

      toast({
        title: "Stock actualizado",
        description: "Los datos se han actualizado correctamente.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar el archivo.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizar stock desde plantilla</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar plantilla
          </Button>
          <div className="relative">
            <Button
              className="w-full"
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Subiendo..." : "Subir archivo"}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};