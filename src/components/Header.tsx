import { Search, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { CartSidebar } from "./CartSidebar";
import { LeftSidebar } from "./LeftSidebar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import { useCartStore } from "@/stores/useCartStore";

export const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { items } = useCartStore();
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not sign out. Please try again.",
        });
      } else {
        navigate("/login");
        toast({
          title: "Success",
          description: "You have been signed out successfully.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Get unique product count
  const uniqueProductCount = new Set(items.map(item => item.product_id)).size;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-primary text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <a href="/" className="flex items-center">
              <img src="https://tvytydguhbrnkcflhmnw.supabase.co/storage/v1/object/sign/Imagenes_ginba/logo/Ginbat-removebg-preview%20(1).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJJbWFnZW5lc19naW5iYS9sb2dvL0dpbmJhdC1yZW1vdmViZy1wcmV2aWV3ICgxKS5wbmciLCJpYXQiOjE3Mzc2NjIwNDcsImV4cCI6MTc2OTE5ODA0N30.KCmhC4XNOALGjBRqp5p-MCGRKEVGoWFWxobWYH68lPs&t=2025-01-23T19%3A54%3A07.494Z" alt="Logo" className="h-12 w-auto max-w-full" />
            </a>
            <div className="max-w-xl w-full">
              <form onSubmit={handleSearch} className="relative">
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar productos..." 
                  className="w-full pl-4 pr-10 py-2 bg-white text-primary"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors hover:scale-110"
                >
                  <Search size={20} />
                </Button>
              </form>
            </div>
            <Button variant="secondary">Nuevo Proyecto</Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white">
              <User className="mr-2" size={20} />
              Mi Cuenta
            </Button>
            <Button 
              variant="ghost" 
              className="text-white relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={20} />
              {uniqueProductCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {uniqueProductCount}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="text-white"
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Second Bar */}
      <nav className="bg-white shadow-md py-2 px-4">
        <div className="container mx-auto">
          <ul className="flex items-center gap-6">
            <li>
              <Button 
                variant="ghost" 
                className="text-primary"
                onClick={() => setIsLeftSidebarOpen(true)}
              >
                Categorías
              </Button>
            </li>
            <li>
              <a href="/favoritos" className="text-primary hover:text-secondary">Favoritos</a>
            </li>
            <li>
              <a href="/pedidos" className="text-primary hover:text-secondary">Pedidos</a>
            </li>
            <li>
              <a href="/proyectos" className="text-primary hover:text-secondary">Proyectos</a>
            </li>
            <li>
              <a href="/facturas" className="text-primary hover:text-secondary">Facturas</a>
            </li>
            <li>
              <a href="/financiacion" className="text-primary hover:text-secondary">Financiación</a>
            </li>
          </ul>
        </div>
      </nav>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LeftSidebar isOpen={isLeftSidebarOpen} onClose={() => setIsLeftSidebarOpen(false)} />
    </header>
  );
};
