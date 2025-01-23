import { create } from 'zustand';
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from '@/types/order';

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  fetchCartItems: () => Promise<void>;
  addToCart: (product: any, quantity: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  totalWithVAT: () => number;
  totalWithoutVAT: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCartItems: async () => {
    set({ isLoading: true });
    try {
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          delivery_method,
          payment_method,
          delivery_location_id,
          pickup_location_id,
          custom_address,
          custom_postal_code,
          custom_city,
          custom_country,
          custom_location_name,
          master_product (
            product_id,
            product_name,
            product_image_url,
            price_with_vat,
            price_without_vat,
            product_uom,
            supplier_name,
            ref_supplier
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cart items:', error);
        throw error;
      }

      console.log('Fetched cart items:', cartItems);

      const formattedItems = cartItems.map(item => ({
        id: Number(item.id),
        quantity: item.quantity,
        delivery_method: item.delivery_method || 'Envío',
        payment_method: item.payment_method || 'Pago inmediato',
        delivery_location_id: item.delivery_location_id,
        pickup_location_id: item.pickup_location_id,
        custom_address: item.custom_address || null,
        custom_postal_code: item.custom_postal_code || null,
        custom_city: item.custom_city || null,
        custom_country: item.custom_country || null,
        custom_location_name: item.custom_location_name || null,
        product_id: item.master_product.product_id,
        product_name: item.master_product.product_name,
        product_image_url: item.master_product.product_image_url,
        price_with_vat: item.master_product.price_with_vat,
        price_without_vat: item.master_product.price_without_vat,
        product_uom: item.master_product.product_uom,
        supplier_name: item.master_product.supplier_name,
        ref_supplier: item.master_product.ref_supplier,
      }));

      console.log('Formatted cart items:', formattedItems);
      set({ items: formattedItems });
    } catch (error) {
      console.error('Error in fetchCartItems:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (product, quantity) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .upsert({
          product_id: product.product_id,
          quantity,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }, {
          onConflict: 'user_id,product_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh cart items
      get().fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id);

      if (error) throw error;

      // Refresh cart items
      get().fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  },

  removeFromCart: async (id) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh cart items
      get().fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  },

  totalWithVAT: () => {
    return get().items.reduce((total, item) => 
      total + (item.price_with_vat * item.quantity), 0
    );
  },

  totalWithoutVAT: () => {
    return get().items.reduce((total, item) => 
      total + (item.price_without_vat * item.quantity), 0
    );
  },
}));
