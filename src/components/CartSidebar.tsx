import { X, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useNavigate } from "react-router-dom";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { items, isLoading, fetchCartItems, updateQuantity, removeFromCart, totalWithVAT, totalWithoutVAT } = useCartStore();

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleQuantityChange = (id: number, change: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      updateQuantity(id, Math.max(1, item.quantity + change));
    }
  };

  const handleViewCart = () => {
    onClose();
    navigate('/carrito');
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      ref={sidebarRef}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Mi Carrito</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 mb-4 pb-4 border-b relative">
                <img
                  src={item.product_image_url || "/placeholder.svg"}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover cursor-pointer"
                  onClick={() => {
                    onClose();
                    navigate(`/productos/${item.product_id}`);
                  }}
                />
                <div className="flex-1">
                  <h3 
                    className="text-sm font-medium cursor-pointer hover:text-primary"
                    onClick={() => {
                      onClose();
                      navigate(`/productos/${item.product_id}`);
                    }}
                  >
                    {item.product_name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">
                      {item.price_without_vat}€ sin IVA
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.price_with_vat}€ con IVA
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t">
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>Total sin IVA:</span>
                <span>{totalWithoutVAT().toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total con IVA:</span>
                <span>{totalWithVAT().toFixed(2)}€</span>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handleViewCart}>
              Ver Carrito
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
