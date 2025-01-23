import { Checkbox } from "@/components/ui/checkbox";

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

export const CategoryFilter = ({ 
  categories, 
  selectedCategories, 
  onCategoryChange 
}: CategoryFilterProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Categorías</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category} className="flex items-center">
            <Checkbox 
              id={category}
              checked={selectedCategories.includes(category)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onCategoryChange([...selectedCategories, category]);
                } else {
                  onCategoryChange(selectedCategories.filter(c => c !== category));
                }
              }}
            />
            <label htmlFor={category} className="ml-2">{category}</label>
          </div>
        ))}
      </div>
    </div>
  );
};