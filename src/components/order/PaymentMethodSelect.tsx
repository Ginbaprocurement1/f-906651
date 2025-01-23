import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAYMENT_METHODS = [
  "Pago inmediato",
  "Pago a 30 días",
  "Pago a 60 días",
  "Pago a 15 días del mes vencido"
];

interface PaymentMethodSelectProps {
  defaultValue: string;
  onValueChange: (value: string) => void;
}

export const PaymentMethodSelect = ({ defaultValue, onValueChange }: PaymentMethodSelectProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Método de pago
      </label>
      <Select
        onValueChange={onValueChange}
        defaultValue={defaultValue}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar método" />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_METHODS.map((method) => (
            <SelectItem key={method} value={method}>
              {method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};