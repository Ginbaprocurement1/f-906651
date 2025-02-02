import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StockTableProps {
  productId: number;
  supplierName: string;
  className?: string;
}

export const StockTable = ({ productId, supplierName, className = "" }: StockTableProps) => {
  const { data: stockData, isLoading } = useQuery({
    queryKey: ["stock", productId, supplierName],
    queryFn: async () => {
      const { data: supplierData } = await supabase
        .from("master_suppliers_company")
        .select("supplier_id")
        .eq("supplier_name", supplierName)
        .single();

      if (!supplierData) return [];

      const { data } = await supabase
        .from("supplier_stock")
        .select(`
          quantity,
          location_id,
          master_suppliers_locations!inner (
            location_name
          )
        `)
        .eq("product_id", productId)
        .eq("supplier_id", supplierData.supplier_id);

      return data || [];
    },
  });

  if (isLoading) {
    return <div className="text-sm text-gray-500">Cargando stock...</div>;
  }

  if (!stockData?.length) {
    return <div className="text-sm text-gray-500">No hay información de stock disponible</div>;
  }

  return (
    <ScrollArea className={`h-[100px] ${className}`}>
      <table className="w-full text-sm">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-2 py-1">Ubicación</th>
            <th className="px-2 py-1">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {stockData.map((stock, index) => (
            <tr key={index} className="border-b">
              <td className="px-2 py-1">{stock.master_suppliers_locations.location_name}</td>
              <td className="px-2 py-1 text-center">{stock.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
};