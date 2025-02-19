import { Search, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const { items } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('master_user')
          .select('user_role')
          .eq('id', user.id)
          .single();
        setUserRole(userData?.user_role || null);
      }
    };
    fetchUserRole();
  }, []);

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
              <img src="https://tvytydguhbrnkcflhmnw.supabase.co/storage/v1/object/sign/Imagenes_ginba/logos/Ginbat-removebg-preview%20(1).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJJbWFnZW5lc19naW5iYS9sb2dvcy9HaW5iYXQtcmVtb3ZlYmctcHJldmlldyAoMSkucG5nIiwiaWF0IjoxNzM4MTc3NTE0LCJleHAiOjE3Njk3MTM1MTR9.tAckwCW_iqLXRlNG-CjxDM983YltDvYi_PMX7CXtJ6E" alt="Logo" className="h-12 w-auto max-w-full" />
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
            {userRole === 'Client' && (
              <Button variant="secondary">Nuevo Proyecto</Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white">
              <User className="mr-2" size={20} />
              Mi Cuenta
            </Button>
            {userRole === 'Client' && (
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
            )}
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
              <a 
                href={userRole === 'Supplier' ? "/productos" : "/favoritos"} 
                className="text-primary hover:text-secondary"
              >
                {userRole === 'Supplier' ? 'Catálogo' : 'Favoritos'}
              </a>
            </li>
            <li>
              <a href="/pedidos" className="text-primary hover:text-secondary">Pedidos</a>
            </li>
            <li>
              <a 
                href={userRole === 'Supplier' ? "/stock" : "/proyectos"} 
                className="text-primary hover:text-secondary"
              >
                {userRole === 'Supplier' ? 'Stock' : 'Proyectos'}
              </a>
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
