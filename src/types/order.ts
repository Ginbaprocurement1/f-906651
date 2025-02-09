
export interface Location {
  delivery_location_id: number;
  address: string | null;
  town: string | null;
  zip_code: string | null;
  province_id: string | null;  // Changed from province to province_id to match DB
  country: string | null;
  location_name: string | null;
  company_id: number | null;
  created_at?: string;
}

export interface SupplierLocation {
  pickup_location_id: number;
  supplier_name: string;
  address: string | null;
  town: string | null;
  zip_code: number | null;
  province_id: string | null;  // Changed from province to province_id to match DB
  country: string | null;
}

export interface DeliveryPreferences {
  delivery_method: 'Envío' | 'Recogida';
  delivery_location_id?: number;  // Changed from string to number
  pickup_location_id?: number | null;  // Changed from string to number
  custom_location_name?: string | null;
  custom_address?: string | null;
  custom_postal_code?: string | null;
  custom_city?: string | null;
  custom_country?: string | null;
  payment_method: string;
}

export interface CartItem {
  id: number;  // Changed from string to number
  product_id: number;
  product_name: string;
  product_image_url: string | null;
  price_with_vat: number;
  price_without_vat: number;
  product_uom: string;
  quantity: number;
  supplier_name: string;
  ref_supplier: string | null;
  delivery_method?: string;
  payment_method?: string;
  delivery_location_id?: number | null;  // Changed from string to number
  pickup_location_id?: number | null;  // Changed from string to number
  custom_address?: string | null;
  custom_postal_code?: string | null;
  custom_city?: string | null;
  custom_country?: string | null;
  custom_location_name?: string | null;
}

export interface GroupedCartItems {
  [supplier: string]: {
    items: CartItem[];
    locations: SupplierLocation[];
  };
}
