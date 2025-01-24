import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface Invoice {
  invoice_id: string;
  invoice_date: string;
  invoice_due_date: string;
  status: string;
  supplier_name: string;
  total_amount: number;
  pdf_url: string | null;
}

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<DateRange | undefined>();
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
    fetchSuppliers();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoice_totals")
        .select("*")
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las facturas",
      });
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("master_suppliers_company")
        .select("supplier_name")
        .not("supplier_name", "is", null);

      if (error) throw error;
      const uniqueSuppliers = [...new Set(data.map(s => s.supplier_name))];
      setSuppliers(uniqueSuppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pagada":
        return "bg-green-100 text-green-800";
      case "Vence hoy":
        return "bg-yellow-100 text-yellow-800";
      case "Vencida":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    const matchesSupplier =
      filterSupplier === "all" || invoice.supplier_name === filterSupplier;
    
    // Date range filter
    const matchesDate = !filterDate?.from || !filterDate?.to || (
      new Date(invoice.invoice_date) >= filterDate.from &&
      new Date(invoice.invoice_date) <= filterDate.to
    );

    return matchesSearch && matchesStatus && matchesDate && matchesSupplier;
  });

  const chartData = invoices
    .filter((invoice) => invoice.status !== "Pagada")
    .reduce((acc: any[], invoice) => {
      const date = new Date(invoice.invoice_due_date).toLocaleDateString();
      const existingDate = acc.find((item) => item.date === date);
      if (existingDate) {
        existingDate.amount += invoice.total_amount;
      } else {
        acc.push({ date, amount: invoice.total_amount });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            className="text-primary hover:text-secondary"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-primary">Mis Facturas</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Buscar
                </label>
                <div className="relative">
                  <Input
                    placeholder="Buscar por número o proveedor"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Estado
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="No vencida">No vencida</SelectItem>
                    <SelectItem value="Vence hoy">Vence hoy</SelectItem>
                    <SelectItem value="Vencida">Vencida</SelectItem>
                    <SelectItem value="Pagada">Pagada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Rango de fechas
                </label>
                <DatePickerWithRange 
                  date={filterDate} 
                  onDateChange={setFilterDate}
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nº Factura</th>
                    <th className="text-left py-3 px-4">Fecha emisión</th>
                    <th className="text-left py-3 px-4">Fecha vencimiento</th>
                    <th className="text-left py-3 px-4">Proveedor</th>
                    <th className="text-left py-3 px-4">Importe (con IVA)</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-right py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.invoice_id} className="border-b last:border-0">
                      <td className="py-3 px-4">{invoice.invoice_id}</td>
                      <td className="py-3 px-4">
                        {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                      </td>
                      <td className="py-3 px-4">
                        {format(new Date(invoice.invoice_due_date), "dd/MM/yyyy")}
                      </td>
                      <td className="py-3 px-4">{invoice.supplier_name}</td>
                      <td className="py-3 px-4">
                        {invoice.total_amount.toLocaleString("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {invoice.pdf_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(invoice.pdf_url!, "_blank")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Importe pendiente por fecha de vencimiento
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Invoices;
