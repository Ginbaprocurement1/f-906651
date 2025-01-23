import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending";
};

const Invoices = () => {
  const [invoices] = useState<Invoice[]>([
    {
      id: "FAC-2024-001",
      date: "2024-02-20",
      amount: 2500.50,
      status: "paid",
    },
    {
      id: "FAC-2024-002",
      date: "2024-02-15",
      amount: 1800.75,
      status: "pending",
    },
  ]);

  const [searchNumber, setSearchNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(invoices);

  useEffect(() => {
    let result = [...invoices];

    // Filter by invoice number
    if (searchNumber) {
      result = result.filter(invoice => 
        invoice.id.toLowerCase().includes(searchNumber.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus && filterStatus !== "all") {
      result = result.filter(invoice => invoice.status === filterStatus);
    }

    // Filter by date
    if (filterDate) {
      result = result.filter(invoice => 
        invoice.date === filterDate
      );
    }

    setFilteredInvoices(result);
  }, [invoices, searchNumber, filterStatus, filterDate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <h1 className="text-3xl font-bold mb-8">Mis Facturas</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Buscar por número</label>
                <div className="relative mt-1">
                  <Input 
                    placeholder="Ej: FAC-2024-001" 
                    value={searchNumber}
                    onChange={(e) => setSearchNumber(e.target.value)}
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="paid">Pagada</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Fecha</label>
                <Input 
                  type="date" 
                  className="mt-1"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
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
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Importe</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-right py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className="py-3 px-4">{invoice.id}</td>
                      <td className="py-3 px-4">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {invoice.amount.toFixed(2)}€
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Invoices;