import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderProduct {
  product_name: string;
  quantity: number;
  price_without_vat: number;
  product_uom: string;
}

interface Order {
  po_id: string;
  supplier_name: string;
  created_at: string;
  delivery_method: string;
  location_name: string;
  address: string;
  zip_code: string;
  town: string;
  country: string;
  payment_method: string;
  total_amount_without_vat: number;
  products: OrderProduct[];
}

const Orders = () => {
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: userData, error: userError } = await supabase
        .from("master_user")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error("No user data found");

      const { data: poHeaders, error: poError } = await supabase
        .from("po_header")
        .select(`
          *,
          master_suppliers_company(supplier_name)
        `)
        .eq("company_id", userData.company_id)
        .order("created_at", { ascending: false });

      if (poError) throw poError;
      if (!poHeaders) return [];

      const ordersWithDetails = await Promise.all(
        poHeaders.map(async (po) => {
          const { data: poLines, error: linesError } = await supabase
            .from("po_line")
            .select(`
              quantity,
              price_without_vat,
              master_product(
                product_name,
                product_uom
              )
            `)
            .eq("po_id", po.po_id);

          if (linesError) throw linesError;
          if (!poLines) return null;

          const total_amount_without_vat = poLines.reduce(
            (acc, line) => acc + (line.quantity * line.price_without_vat),
            0
          );

          const products = poLines.map(line => ({
            product_name: line.master_product?.product_name || "Unknown Product",
            quantity: line.quantity,
            price_without_vat: line.price_without_vat,
            product_uom: line.master_product?.product_uom || "unit"
          }));

          return {
            po_id: po.po_id,
            supplier_name: po.master_suppliers_company?.supplier_name || "Unknown Supplier",
            created_at: po.created_at,
            delivery_method: po.delivery_method,
            location_name: po.location_name,
            address: po.address,
            zip_code: po.zip_code,
            town: po.town,
            country: po.country,
            payment_method: po.payment_method,
            total_amount_without_vat,
            products
          };
        })
      );

      return ordersWithDetails.filter((order): order is Order => order !== null);
    }
  });

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Pedidos</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No hay pedidos para mostrar
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders?.map((order) => (
              <Card key={order.po_id} className="p-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value="products" className="border-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h2 className="font-bold text-lg">{order.po_id}</h2>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "PPP", { locale: es })}
                        </p>
                        <p>{order.supplier_name}</p>
                      </div>
                      <div>
                        <p>{order.delivery_method}</p>
                        <p>{order.location_name}</p>
                        <p>{order.address}</p>
                        <p>{`${order.zip_code} ${order.town}`}</p>
                        <p>{order.country}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                      <p>
                        <span className="font-medium">Total sin IVA:</span>{" "}
                        {order.total_amount_without_vat.toFixed(2)}€
                      </p>
                      <p>
                        <span className="font-medium">Total con IVA:</span>{" "}
                        {(order.total_amount_without_vat * 1.21).toFixed(2)}€
                      </p>
                      <p>
                        <span className="font-medium">Método de pago:</span>{" "}
                        {order.payment_method}
                      </p>
                    </div>

                    <AccordionTrigger className="py-0">
                      <div className="flex items-center gap-2">
                        <span>Productos</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-12 gap-4 font-medium">
                          <div className="col-span-6 break-words max-w-[50%]"></div>
                          <div className="col-span-2 text-right">Cantidad</div>
                          <div className="col-span-4 text-right">Precio sin IVA</div>
                        </div>
                        {order.products.map((product, index) => (
                          <div
                            key={index}
                            className={`grid grid-cols-12 gap-4 items-center ${
                              index === order.products.length - 1 ? "border-0" : "border-b border-gray-200"
                            } py-2`}
                          >
                            <div className="col-span-6 break-words max-w-[50%]">
                              {product.product_name}
                            </div>
                            <div className="col-span-2 text-right">
                              {product.quantity} {product.product_uom}
                            </div>
                            <div className="col-span-4 text-right">
                              {product.price_without_vat.toFixed(2)} €/ud
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;