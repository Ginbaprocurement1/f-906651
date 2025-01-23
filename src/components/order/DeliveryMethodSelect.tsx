import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DeliveryMethodSelectProps {
  defaultValue: string;
  onValueChange: (value: string) => void;
  supplier?: string; // Made optional with ?
}

export const DeliveryMethodSelect = ({ defaultValue, onValueChange }: DeliveryMethodSelectProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Método de envío
      </label>
      <Select
        onValueChange={onValueChange}
        defaultValue={defaultValue}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar método" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Envío">Envío</SelectItem>
          <SelectItem value="Recogida">Recogida</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};