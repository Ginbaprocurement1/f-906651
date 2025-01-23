import { useState } from "react";
import { ShoppingCart, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const TopBar = () => {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto">
        {/* First Bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <a href="/" className="text-2xl font-bold text-neutral-800">
              Ginbat
            </a>
            <Button variant="outline" className="hidden md:flex">
              Nuevo proyecto
            </Button>
          </div>

          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="w-full pl-4 pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost">Mi cuenta</Button>
            <div className="relative">
              <Button variant="ghost" className="relative">
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Second Bar */}
        <div className="border-t border-neutral-100">
          <div className="flex items-center gap-6 py-2 overflow-x-auto">
            <Button variant="ghost" className="flex items-center gap-2">
              <Menu size={20} />
              Categorías de productos
            </Button>
            <Button variant="ghost">Favoritos</Button>
            <Button variant="ghost">Pedidos</Button>
            <Button variant="ghost">Proyectos</Button>
            <Button variant="ghost">Facturas</Button>
            <Button variant="ghost">Financiación</Button>
          </div>
        </div>
      </div>
    </div>
  );
};