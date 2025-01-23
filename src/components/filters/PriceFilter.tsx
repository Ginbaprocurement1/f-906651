import { Slider } from "@/components/ui/slider";

interface PriceFilterProps {
  priceRange: number[];
  onPriceChange: (range: number[]) => void;
}

export const PriceFilter = ({ priceRange, onPriceChange }: PriceFilterProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Precio</h3>
      <Slider
        defaultValue={[0, 1000]}
        max={1000}
        step={1}
        value={priceRange}
        onValueChange={onPriceChange}
        className="mt-2"
      />
      <div className="flex justify-between mt-2 text-sm">
        <span>{priceRange[0]}€</span>
        <span>{priceRange[1]}€</span>
      </div>
    </div>
  );
};