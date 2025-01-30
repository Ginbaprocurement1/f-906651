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
    const errors: string[] = [];

    try {
      // Get existing products for this supplier
      const { data: existingProducts, error: fetchError } = await supabase
        .from('master_product')
        .select('product_id, product_name')
        .eq('supplier_name', supplierName);

      if (fetchError) throw fetchError;

      const existingProductNames = new Set(existingProducts?.map(p => p.product_name) || []);
      const uploadedProductNames = new Set();

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ProductTemplate[];

      // Process each row in the Excel file
      for (const row of jsonData) {
        try {
          if (!row.product_name) {
            errors.push(`Hay un producto sin nombre`);
            continue;
          }

          uploadedProductNames.add(row.product_name);

          const productData = {
            ...row,
            supplier_name: supplierName,
          };

          if (existingProductNames.has(row.product_name)) {
            // Update existing product
            const { error: updateError } = await supabase
              .from('master_product')
              .update(productData)
              .eq('product_name', row.product_name)
              .eq('supplier_name', supplierName);

            if (updateError) {
              errors.push(`No se pudo actualizar el producto "${row.product_name}"`);
            }
          } else {
            // Insert new product
            const { error: insertError } = await supabase
              .from('master_product')
              .insert([productData]);

            if (insertError) {
              errors.push(`No se pudo crear el producto "${row.product_name}"`);
            }
          }
        } catch (rowError) {
          errors.push(`Error procesando el producto "${row.product_name}": ${rowError.message}`);
        }
      }

      // Delete products that are not in the uploaded file
      const productsToDelete = Array.from(existingProductNames)
        .filter(name => !uploadedProductNames.has(name));

      if (productsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('master_product')
          .delete()
          .eq('supplier_name', supplierName)
          .in('product_name', productsToDelete);

        if (deleteError) {
          errors.push('No se pudieron eliminar algunos productos obsoletos');
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
          description: "Productos actualizados correctamente",
        });
      }
      
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
              El nombre del producto es el identificador único de cada producto.
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