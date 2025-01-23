import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  name: string;
  image: string;
}

export const CategoryGrid = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch initial categories
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('master_product_category')
        .select('product_category, icon_link')
        .order('product_category');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      setCategories(
        data.map(cat => ({
          name: cat.product_category,
          image: cat.icon_link || 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&auto=format&fit=crop' // Fallback image
        }))
      );
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

  const handleCategoryClick = (category: string) => {
    navigate(`/productos?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category, index) => (
        <button
          key={index}
          onClick={() => handleCategoryClick(category.name)}
          className="group relative aspect-square overflow-hidden rounded-lg hover:shadow-lg transition-shadow"
        >
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-center font-medium px-2">
                {category.name}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};