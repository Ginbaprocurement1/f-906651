import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CategoryFilter } from "./filters/CategoryFilter";
import { PriceFilter } from "./filters/PriceFilter";
import { ManufacturerFilter } from "./filters/ManufacturerFilter";
import { SupplierFilter } from "./filters/SupplierFilter";
import { AvailabilityFilter } from "./filters/AvailabilityFilter";

interface ProductFiltersProps {
  onFilterChange: (filters: {
    categories: string[];
    priceRange: number[];
    manufacturers: string[];
    suppliers: string[];
    availability: string[];
  }) => void;
}

export const ProductFilters = ({ onFilterChange }: ProductFiltersProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [availabilityOptions, setAvailabilityOptions] = useState<string[]>([]);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      // Fetch unique categories
      const { data: categoryData } = await supabase
        .from('master_product')
        .select('product_category_l1')
        .not('product_category_l1', 'is', null);
      
      // Fetch unique manufacturers
      const { data: manufacturerData } = await supabase
        .from('master_product')
        .select('manufacturer')
        .not('manufacturer', 'is', null);
      
      // Fetch unique suppliers
      const { data: supplierData } = await supabase
        .from('master_product')
        .select('supplier_name')
        .not('supplier_name', 'is', null);
      
      // Fetch unique availability options
      const { data: availabilityData } = await supabase
        .from('master_product')
        .select('stock_demand_category')
        .not('stock_demand_category', 'is', null);

      if (categoryData) {
        setCategories([...new Set(categoryData.map(item => item.product_category_l1))]);
      }
      if (manufacturerData) {
        setManufacturers([...new Set(manufacturerData.map(item => item.manufacturer))]);
      }
      if (supplierData) {
        setSuppliers([...new Set(supplierData.map(item => item.supplier_name))]);
      }
      if (availabilityData) {
        setAvailabilityOptions([...new Set(availabilityData.map(item => item.stock_demand_category))]);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    onFilterChange({
      categories: selectedCategories,
      priceRange,
      manufacturers: selectedManufacturers,
      suppliers: selectedSuppliers,
      availability: selectedAvailability,
    });
  }, [selectedCategories, priceRange, selectedManufacturers, selectedSuppliers, selectedAvailability]);

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setSelectedManufacturers([]);
    setSelectedSuppliers([]);
    setSelectedAvailability([]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-32">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>
      
      <div className="space-y-6">
        <CategoryFilter
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
        />

        <PriceFilter
          priceRange={priceRange}
          onPriceChange={setPriceRange}
        />

        <ManufacturerFilter
          manufacturers={manufacturers}
          selectedManufacturers={selectedManufacturers}
          onManufacturerChange={setSelectedManufacturers}
        />

        <SupplierFilter
          suppliers={suppliers}
          selectedSuppliers={selectedSuppliers}
          onSupplierChange={setSelectedSuppliers}
        />

        <AvailabilityFilter
          availabilityOptions={availabilityOptions}
          selectedAvailability={selectedAvailability}
          onAvailabilityChange={setSelectedAvailability}
        />

        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleClearFilters}
        >
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
};