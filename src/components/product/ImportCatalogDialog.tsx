import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { Product } from "@/types/product";

interface ImportCatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierName: string;
  onSuccess?: () => void;
}

export const ImportCatalogDialog = ({
  open,
  onOpenChange,
  supplierName,
  onSuccess
}: ImportCatalogDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      const { data: products, error } = await supabase
        .from('master_product')
        .select('product_name, product_description, product_uom, product_category_l1, price_without_vat, price_with_vat, ref_supplier, manufacturer')
        .eq('supplier_name', supplierName);

      if (error) throw error;

      const ws = XLSX.utils.json_to_sheet(products || []);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, "product_catalog.xlsx");
    } catch (error) {
      console.error('Error downloading catalog:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar el catálogo",
      });
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        for (const row of jsonData) {
          const product: Partial<Product> & { supplier_name: string } = {
            supplier_name: supplierName,
            product_name: (row as any).product_name,
            product_description: (row as any).product_description,
            product_uom: (row as any).product_uom,
            product_category_l1: (row as any).product_category_l1,
            price_without_vat: parseFloat((row as any).price_without_vat),
            price_with_vat: parseFloat((row as any).price_with_vat),
            ref_supplier: (row as any).ref_supplier,
            manufacturer: (row as any).manufacturer,
          };

          const { data: existingProduct } = await supabase
            .from('master_product')
            .select('product_id')
            .eq('supplier_name', supplierName)
            .eq('product_name', product.product_name)
            .single();

          if (existingProduct) {
            const { error: updateError } = await supabase
              .from('master_product')
              .update(product)
              .eq('product_id', existingProduct.product_id);

            if (updateError) throw updateError;
          } else {
            const { error: insertError } = await supabase
              .from('master_product')
              .insert([product]);

            if (insertError) throw insertError;
          }
        }

        toast({
          title: "Catálogo actualizado",
          description: "El catálogo se ha actualizado correctamente",
        });
        onSuccess?.();
        onOpenChange(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading catalog:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el catálogo",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importar catálogo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button onClick={handleDownload} className="w-full" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar plantilla
          </Button>
          <div className="relative">
            <Button disabled={isLoading} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {isLoading ? "Subiendo..." : "Subir catálogo"}
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};