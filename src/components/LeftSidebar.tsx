import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeftSidebar = ({ isOpen, onClose }: LeftSidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Fetch initial categories
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('master_product_category')
        .select('product_category')
        .order('product_category');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      setCategories(data.map(cat => cat.product_category));
    };

    fetchCategories();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'master_product_category'
        },
        () => {
          // Refetch categories when any change occurs
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const handleCategoryClick = (category: string) => {
    navigate(`/productos?category=${encodeURIComponent(category)}`);
    onClose();
  };

  return (
    <div
      ref={sidebarRef}
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-semibold">Categorías</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="block w-full text-left py-2 px-4 hover:bg-accent rounded-md transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};