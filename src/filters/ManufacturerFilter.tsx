import { Checkbox } from "@/components/ui/checkbox";

interface ManufacturerFilterProps {
  manufacturers: string[];
  selectedManufacturers: string[];
  onManufacturerChange: (manufacturers: string[]) => void;
}

export const ManufacturerFilter = ({ 
  manufacturers, 
  selectedManufacturers, 
  onManufacturerChange 
}: ManufacturerFilterProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Marcas</h3>
      <div className="space-y-2">
        {manufacturers.map((manufacturer) => (
          <div key={manufacturer} className="flex items-center">
            <Checkbox 
              id={manufacturer}
              checked={selectedManufacturers.includes(manufacturer)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onManufacturerChange([...selectedManufacturers, manufacturer]);
                } else {
                  onManufacturerChange(selectedManufacturers.filter(m => m !== manufacturer));
                }
              }}
            />
            <label htmlFor={manufacturer} className="ml-2">{manufacturer}</label>
          </div>
        ))}
      </div>
    </div>
  );
};