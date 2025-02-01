import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: number;
  warehouseId: number;
}

export const AddProductDialog = ({ open, onOpenChange, supplierId, warehouseId }: AddProductDialogProps) => {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['supplierProducts', supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_product')
        .select('product_id, product_name')
        .eq('supplier_name', (await supabase
          .from('master_suppliers_company')
          .select('supplier_name')
          .eq('supplier_id', supplierId)
          .single()
        ).data?.supplier_name);
      
      if (error) throw error;
      return data;
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('supplier_stock')
        .insert({
          supplier_id: supplierId,
          location_id: warehouseId,
          product_id: parseInt(selectedProduct),
          quantity: parseFloat(quantity),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouseStock'] });
      toast({
        title: "Producto añadido",
        description: "El producto se ha añadido correctamente al stock.",
      });
      onOpenChange(false);
      setSelectedProduct("");
      setQuantity("");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo añadir el producto. Por favor, inténtalo de nuevo.",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedProduct || !quantity || isNaN(parseFloat(quantity))) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa todos los campos correctamente.",
      });
      return;
    }
    addProductMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir producto</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="product">Producto</label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.product_id} value={product.product_id.toString()}>
                    {product.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="quantity">Cantidad</label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Aceptar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};