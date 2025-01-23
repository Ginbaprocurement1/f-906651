import { Checkbox } from "@/components/ui/checkbox";

interface AvailabilityFilterProps {
  availabilityOptions: string[];
  selectedAvailability: string[];
  onAvailabilityChange: (availability: string[]) => void;
}

export const AvailabilityFilter = ({ 
  availabilityOptions, 
  selectedAvailability, 
  onAvailabilityChange 
}: AvailabilityFilterProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Disponibilidad</h3>
      <div className="space-y-2">
        {availabilityOptions.map((option) => (
          <div key={option} className="flex items-center">
            <Checkbox 
              id={option}
              checked={selectedAvailability.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onAvailabilityChange([...selectedAvailability, option]);
                } else {
                  onAvailabilityChange(selectedAvailability.filter(o => o !== option));
                }
              }}
            />
            <label htmlFor={option} className="ml-2">{option}</label>
          </div>
        ))}
      </div>
    </div>
  );
};
