import { useState } from "react";
import { cn } from "@/lib/utils";

interface Variant {
  name: string;
  values: string[];
}

interface ProductVariantsProps {
  variants: Variant[];
  onVariantChange: (variant: string, value: string) => void;
}

export const ProductVariants = ({ variants, onVariantChange }: ProductVariantsProps) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const handleVariantSelect = (variant: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variant]: value }));
    onVariantChange(variant, value);
  };

  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <div key={variant.name}>
          <h3 className="text-sm font-medium text-product-text mb-2">
            {variant.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {variant.values.map((value) => (
              <button
                key={value}
                onClick={() => handleVariantSelect(variant.name, value)}
                className={cn(
                  "px-3 py-1 rounded-md text-sm border",
                  selectedVariants[variant.name] === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};