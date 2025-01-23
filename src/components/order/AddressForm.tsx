import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddressFormProps {
  customAddress: string;
  customPostalCode: string;
  customCity: string;
  customCountry: string;
  newLocationName: string;
  isCustomMode: boolean;
  isDelivery: boolean;
  disabled: boolean;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPostalCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveAddress: () => void;
}

export const AddressForm = ({
  customAddress,
  customPostalCode,
  customCity,
  customCountry,
  newLocationName,
  isCustomMode,
  isDelivery,
  disabled,
  onAddressChange,
  onPostalCodeChange,
  onCityChange,
  onCountryChange,
  onLocationNameChange,
  onSaveAddress,
}: AddressFormProps) => {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Dirección"
        value={customAddress}
        onChange={onAddressChange}
        disabled={!isCustomMode || disabled}
        className={!isCustomMode || disabled ? "bg-gray-100" : ""}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Código postal"
          value={customPostalCode}
          onChange={onPostalCodeChange}
          disabled={!isCustomMode || disabled}
          className={!isCustomMode || disabled ? "bg-gray-100" : ""}
        />
        <Input
          placeholder="Ciudad"
          value={customCity}
          onChange={onCityChange}
          disabled={!isCustomMode || disabled}
          className={!isCustomMode || disabled ? "bg-gray-100" : ""}
        />
      </div>
      <Input
        placeholder="País"
        value={customCountry}
        onChange={onCountryChange}
        disabled={!isCustomMode || disabled}
        className={!isCustomMode || disabled ? "bg-gray-100" : ""}
      />
      
      {isCustomMode && isDelivery && (
        <div className="space-y-4">
          <Input
            placeholder="Nombre dirección"
            value={newLocationName}
            onChange={onLocationNameChange}
          />
          <Button 
            onClick={onSaveAddress}
            disabled={!newLocationName || !customAddress || !customPostalCode || !customCity || !customCountry}
          >
            Guardar dirección
          </Button>
        </div>
      )}
    </div>
  );
};