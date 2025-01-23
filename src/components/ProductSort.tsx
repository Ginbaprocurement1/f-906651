import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "relevance" | "price-asc" | "price-desc" | "rating";

interface ProductSortProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export const ProductSort = ({ sortBy, onSortChange }: ProductSortProps) => {
  return (
    <Select value={sortBy} onValueChange={onSortChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevance">Relevancia</SelectItem>
        <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
        <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
        <SelectItem value="rating">Valoración</SelectItem>
      </SelectContent>
    </Select>
  );
};