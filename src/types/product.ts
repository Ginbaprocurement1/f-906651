export interface Product {
  product_id: number;
  product_name: string;
  product_description?: string;
  product_uom?: string;
  product_category_l1?: string;
  product_image_url?: string;
  manufacturer?: string;
  supplier_name?: string;
  price_without_vat: number;
  price_with_vat: number;
  ref_supplier?: string;
}