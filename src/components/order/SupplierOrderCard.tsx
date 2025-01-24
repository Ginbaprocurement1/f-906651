import { CartItem, Location, SupplierLocation } from "@/types/order";
import { DeliveryMethodSelect } from "./DeliveryMethodSelect";
import { PaymentMethodSelect } from "./PaymentMethodSelect";
import { LocationSelect } from "./LocationSelect";
import { AddressForm } from "./AddressForm";
import { ProductList } from "./ProductList";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface SupplierOrderCardProps {
  supplier: string;
  items: CartItem[];
  locations: SupplierLocation[];
  clientLocations: Location[];
  selectedLocation: string;
  customAddressMode: boolean;
  customAddress: string;
  customPostalCode: string;
  customCity: string;
  customCountry: string;
  newLocationName: string;
  onDeliveryMethodChange: (method: string) => void;
  onPaymentMethodChange: (method: string) => void;
  onLocationSelect: (locationId: string) => void;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPostalCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveAddress: () => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

export const SupplierOrderCard = ({
  supplier,
  items,
  locations,
  clientLocations,
  selectedLocation,
  customAddressMode,
  customAddress,
  customPostalCode,
  customCity,
  customCountry,
  newLocationName,
  onDeliveryMethodChange,
  onPaymentMethodChange,
  onLocationSelect,
  onAddressChange,
  onPostalCodeChange,
  onCityChange,
  onCountryChange,
  onLocationNameChange,
  onSaveAddress,
  onUpdateQuantity,
  onRemoveItem,
}: SupplierOrderCardProps) => {
  const [supplierAddress, setSupplierAddress] = useState({
    address: "",
    postalCode: "",
    city: "",
    country: ""
  });

  const handleDeliveryMethodChange = async (method: string) => {
    setSupplierAddress({
      address: "",
      postalCode: "",
      city: "",
      country: ""
    });
    
    onDeliveryMethodChange(method);
    onLocationSelect("");
  };

  const handleLocationSelect = async (locationId: string, locationData?: any) => {
    onLocationSelect(locationId);
    
    if (items[0]?.delivery_method === "Envío") {
      if (locationId === "custom") {
        setSupplierAddress({
          address: "",
          postalCode: "",
          city: "",
          country: ""
        });
      } else if (locationData) {
        setSupplierAddress({
          address: locationData.address || "",
          postalCode: locationData.zip_code || "",
          city: locationData.town || "",
          country: locationData.country || ""
        });
      }
    } else if (locationData) {
      setSupplierAddress({
        address: locationData.address || "",
        postalCode: String(locationData.zip_code) || "",
        city: locationData.town || "",
        country: locationData.country || ""
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">{supplier}</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <DeliveryMethodSelect
            defaultValue={items[0]?.delivery_method || "Envío"}
            onValueChange={handleDeliveryMethodChange}
            supplier={supplier}
          />
          <PaymentMethodSelect
            defaultValue={items[0]?.payment_method || "Pago inmediato"}
            onValueChange={onPaymentMethodChange}
          />
        </div>

        <div className="space-y-4">
          <LocationSelect
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            clientLocations={clientLocations}
            isDelivery={items[0]?.delivery_method === "Envío"}
            supplierLocations={locations}
            supplierName={supplier}
          />

          <AddressForm
            customAddress={supplierAddress.address}
            customPostalCode={supplierAddress.postalCode}
            customCity={supplierAddress.city}
            customCountry={supplierAddress.country}
            newLocationName={newLocationName}
            isCustomMode={customAddressMode}
            isDelivery={items[0]?.delivery_method === "Envío"}
            disabled={!customAddressMode && items[0]?.delivery_method === "Envío" || items[0]?.delivery_method === "Recogida"}
            onAddressChange={onAddressChange}
            onPostalCodeChange={onPostalCodeChange}
            onCityChange={onCityChange}
            onCountryChange={onCountryChange}
            onLocationNameChange={onLocationNameChange}
            onSaveAddress={onSaveAddress}
          />
        </div>

        <ProductList
          items={items}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
        />
      </div>
    </div>
  );
};
