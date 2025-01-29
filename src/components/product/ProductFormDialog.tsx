import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierName: string;
  onSuccess?: () => void;
  productToEdit?: any;
}

export const ProductFormDialog = ({ 
  open, 
  onOpenChange,
  supplierName,
  onSuccess,
  productToEdit 
}: ProductFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [productData, setProductData] = useState({
    product_name: "",
    product_description: "",
    product_uom: "",
    product_category_l1: "",
    price_without_vat: "",
    price_with_vat: "",
    ref_supplier: "",
    manufacturer: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('master_product_category')
        .select('product_category');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      setCategories(data.map(cat => cat.product_category));
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (productToEdit) {
      setProductData({
        product_name: productToEdit.product_name || "",
        product_description: productToEdit.product_description || "",
        product_uom: productToEdit.product_uom || "",
        product_category_l1: productToEdit.product_category_l1 || "",
        price_without_vat: productToEdit.price_without_vat?.toString() || "",
        price_with_vat: productToEdit.price_with_vat?.toString() || "",
        ref_supplier: productToEdit.ref_supplier || "",
        manufacturer: productToEdit.manufacturer || "",
      });
    }
  }, [productToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product_images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const productPayload = {
        ...productData,
        supplier_name: supplierName,
        product_image_url: imageUrl || productToEdit?.product_image_url,
        price_without_vat: parseFloat(productData.price_without_vat),
        price_with_vat: parseFloat(productData.price_with_vat),
      };

      if (productToEdit) {
        const { error } = await supabase
          .from('master_product')
          .update(productPayload)
          .eq('product_id', productToEdit.product_id);

        if (error) throw error;

        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from('master_product')
          .insert([productPayload]);

        if (error) throw error;

        toast({
          title: "Producto creado",
          description: "El producto se ha creado correctamente",
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el producto. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{productToEdit ? 'Modificar producto' : 'Añadir nuevo producto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="product_name">Nombre del producto</Label>
              <Input
                id="product_name"
                value={productData.product_name}
                onChange={(e) => setProductData(prev => ({ ...prev, product_name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="product_description">Descripción del producto</Label>
              <Textarea
                id="product_description"
                value={productData.product_description}
                onChange={(e) => setProductData(prev => ({ ...prev, product_description: e.target.value }))}
                className="h-32"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_uom">Unidad de medida</Label>
                <Select
                  value={productData.product_uom}
                  onValueChange={(value) => setProductData(prev => ({ ...prev, product_uom: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {["kg", "ud", "l", "m"].map((uom) => (
                      <SelectItem key={uom} value={uom}>
                        {uom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="product_category">Categoría de producto</Label>
                <Select
                  value={productData.product_category_l1}
                  onValueChange={(value) => setProductData(prev => ({ ...prev, product_category_l1: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="product_image">Imagen del producto</Label>
              <Input
                id="product_image"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_without_vat">Precio sin IVA</Label>
                <Input
                  id="price_without_vat"
                  type="number"
                  step="0.01"
                  value={productData.price_without_vat}
                  onChange={(e) => setProductData(prev => ({ ...prev, price_without_vat: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="price_with_vat">Precio con IVA</Label>
                <Input
                  id="price_with_vat"
                  type="number"
                  step="0.01"
                  value={productData.price_with_vat}
                  onChange={(e) => setProductData(prev => ({ ...prev, price_with_vat: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ref_supplier">Referencia del proveedor</Label>
                <Input
                  id="ref_supplier"
                  value={productData.ref_supplier}
                  onChange={(e) => setProductData(prev => ({ ...prev, ref_supplier: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="manufacturer">Fabricante</Label>
                <Input
                  id="manufacturer"
                  value={productData.manufacturer}
                  onChange={(e) => setProductData(prev => ({ ...prev, manufacturer: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (productToEdit ? "Actualizando..." : "Creando...") : (productToEdit ? "Actualizar" : "Crear")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};