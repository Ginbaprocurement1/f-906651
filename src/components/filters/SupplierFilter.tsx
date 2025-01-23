import { Checkbox } from "@/components/ui/checkbox";

interface SupplierFilterProps {
  suppliers: string[];
  selectedSuppliers: string[];
  onSupplierChange: (suppliers: string[]) => void;
}

export const SupplierFilter = ({ 
  suppliers, 
  selectedSuppliers, 
  onSupplierChange 
}: SupplierFilterProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Proveedores</h3>
      <div className="space-y-2">
        {suppliers.map((supplier) => (
          <div key={supplier} className="flex items-center">
            <Checkbox 
              id={supplier}
              checked={selectedSuppliers.includes(supplier)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSupplierChange([...selectedSuppliers, supplier]);
                } else {
                  onSupplierChange(selectedSuppliers.filter(s => s !== supplier));
                }
              }}
            />
            <label htmlFor={supplier} className="ml-2">{supplier}</label>
          </div>
        ))}
      </div>
    </div>
  );
};