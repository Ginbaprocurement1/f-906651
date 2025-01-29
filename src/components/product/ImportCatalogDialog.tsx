import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { toast } from "@/hooks/use-toast";

interface ImportCatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierName: string;
  onSuccess: () => void;
}

interface ProductTemplate {
  product_name: string;
  product_description?: string;
  product_uom: string;
  product_category_l1?: string;
  price_without_vat: number;
  price_with_vat: number;
  ref_supplier?: string;
  manufacturer?: string;
}

export const ImportCatalogDialog = ({ 
  open, 
  onOpenChange,
  supplierName,
  onSuccess 
}: ImportCatalogDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase
        .from('master_product')
        .select('product_name, product_description, product_uom, product_category_l1, price_without_vat, price_with_vat, ref_supplier, manufacturer')
        .eq('supplier_name', supplierName);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontraron productos para descargar",
        });
        return;
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, "product_template.xlsx");

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

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ProductTemplate[];

      for (const row of jsonData) {
        const { data: existingProduct, error: searchError } = await supabase
          .from('master_product')
          .select('product_id')
          .eq('supplier_name', supplierName)
          .eq('product_name', row.product_name)
          .maybeSingle();

        if (searchError) {
          console.error('Error searching for product:', searchError);
          continue;
        }

        const productData = {
          ...row,
          supplier_name: supplierName,
        };

        if (existingProduct) {
          const { error: updateError } = await supabase
            .from('master_product')
            .update(productData)
            .eq('product_id', existingProduct.product_id);

          if (updateError) {
            console.error('Error updating product:', updateError);
          }
        } else {
          const { error: insertError } = await supabase
            .from('master_product')
            .insert([productData]);

          if (insertError) {
            console.error('Error inserting product:', insertError);
          }
        }
      }

      toast({
        title: "Éxito",
        description: "Productos actualizados correctamente",
      });
      onSuccess();
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
  }, [supplierName, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar catálogo desde plantilla</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Descarga la plantilla con tus productos actuales, modifícala y súbela de nuevo para actualizar tu catálogo.
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