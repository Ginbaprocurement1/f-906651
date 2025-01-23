import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Location } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface LocationSelectProps {
  selectedLocation: string;
  onLocationSelect: (locationId: string, locationData?: Location) => void;
  clientLocations: Location[];
  isDelivery: boolean;
  supplierLocations: any[];
  supplierName?: string;
}

export const LocationSelect = ({
  selectedLocation,
  onLocationSelect,
  clientLocations,
  isDelivery,
  supplierLocations,
  supplierName
}: LocationSelectProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredSupplierLocations, setFilteredSupplierLocations] = useState<any[]>([]);

  useEffect(() => {
    const fetchClientLocations = async () => {
      const { data: clientLocs, error } = await supabase
        .from('master_client_locations')
        .select('*');
      
      if (!error && clientLocs) {
        setLocations(clientLocs);
      }
    };

    if (isDelivery) {
      fetchClientLocations();
    }
  }, [isDelivery]);

  useEffect(() => {
    if (!isDelivery && supplierName) {
      const fetchSupplierLocations = async () => {
        const { data: locations, error } = await supabase
          .from('master_suppliers_locations')
          .select(`
            *,
            master_suppliers_company!inner (
              supplier_name
            )
          `)
          .eq('master_suppliers_company.supplier_name', supplierName);

        if (!error && locations) {
          setFilteredSupplierLocations(locations);
        }
      };

      fetchSupplierLocations();
    }
  }, [isDelivery, supplierName]);

  const handleLocationSelect = async (locationId: string) => {
    try {
      if (!supplierName) {
        console.error('Supplier name is required');
        return;
      }

      // Get cart items for this specific supplier
      const { data: cartItems, error: fetchError } = await supabase
        .from('cart_items')
        .select(`
          id,
          master_product!inner (
            supplier_name
          )
        `)
        .eq('master_product.supplier_name', supplierName);

      if (fetchError) {
        console.error('Error fetching cart items:', fetchError);
        throw fetchError;
      }

      if (!cartItems || cartItems.length === 0) {
        console.log('No cart items found for supplier:', supplierName);
        return;
      }

      // Custom address mode
      if (locationId === "custom" && isDelivery) {
        for (const item of cartItems) {
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({
              delivery_location_id: null,
              pickup_location_id: null,
              custom_address: null,
              custom_postal_code: null,
              custom_city: null,
              custom_country: null,
              custom_location_name: null
            })
            .eq('id', item.id);

          if (updateError) {
            console.error('Error updating cart item:', updateError);
            throw updateError;
          }
        }
        onLocationSelect(locationId);
      } 
      // Delivery location selected
      else if (isDelivery) {
        const selectedLocation = locations.find(loc => 
          loc.delivery_location_id === Number(locationId)
        );
        
        if (selectedLocation) {
          for (const item of cartItems) {
            const { error: updateError } = await supabase
              .from('cart_items')
              .update({
                delivery_location_id: selectedLocation.delivery_location_id,
                pickup_location_id: null,
                custom_address: null,
                custom_postal_code: null,
                custom_city: null,
                custom_country: null,
                custom_location_name: null
              })
              .eq('id', item.id);

            if (updateError) {
              console.error('Error updating cart item:', updateError);
              throw updateError;
            }
          }
          onLocationSelect(locationId, selectedLocation);
        }
      } 
      // Pickup location selected
      else {
        const selectedLocation = filteredSupplierLocations.find(loc => 
          loc.pickup_location_id === Number(locationId)
        );
        
        if (selectedLocation) {
          for (const item of cartItems) {
            const { error: updateError } = await supabase
              .from('cart_items')
              .update({
                delivery_location_id: null,
                pickup_location_id: selectedLocation.pickup_location_id,
                custom_address: null,
                custom_postal_code: null,
                custom_city: null,
                custom_country: null,
                custom_location_name: null
              })
              .eq('id', item.id);

            if (updateError) {
              console.error('Error updating cart item:', updateError);
              throw updateError;
            }
          }
          onLocationSelect(locationId, selectedLocation);
        }
      }
    } catch (error) {
      console.error('Error in handleLocationSelect:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la ubicación",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {isDelivery ? "Punto de entrega" : "Punto de recogida"}
      </label>
      <Select value={selectedLocation} onValueChange={handleLocationSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar ubicación" />
        </SelectTrigger>
        <SelectContent>
          {isDelivery && <SelectItem value="custom">Otra dirección</SelectItem>}
          {isDelivery ? (
            locations.map((location) => (
              <SelectItem 
                key={location.delivery_location_id} 
                value={String(location.delivery_location_id)}
              >
                {location.location_name || location.address}
              </SelectItem>
            ))
          ) : (
            filteredSupplierLocations.map((location) => (
              <SelectItem 
                key={location.pickup_location_id} 
                value={String(location.pickup_location_id)}
              >
                {location.location_name || `${location.town} - ${location.address}`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};