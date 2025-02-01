import { Header } from "@/components/Header";

import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ShoppingCart, Trash2, Heart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const Favorites = () => {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: "Ladrillo Tabiquero",
      price: 0.44,
      image: "/lovable-uploads/1f1f5bf8-6210-4cd6-b390-085411db2939.png",
      selected: false,
    },
  ]);

  const [selectedAll, setSelectedAll] = useState(false);

  const toggleSelectAll = () => {
    setSelectedAll(!selectedAll);
    setFavorites(favorites.map(item => ({ ...item, selected: !selectedAll })));
  };

  const toggleSelect = (id: number) => {
    setFavorites(favorites.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const removeSelected = () => {
    setFavorites(favorites.filter(item => !item.selected));
    setSelectedAll(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <h1 className="text-3xl font-bold mb-8">Mis Favoritos</h1>

        {favorites.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Checkbox
                  id="select-all"
                  checked={selectedAll}
                  onCheckedChange={toggleSelectAll}
                />
                <label htmlFor="select-all" className="ml-2">
                  Seleccionar todo
                </label>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={removeSelected}
                  disabled={!favorites.some(item => item.selected)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar seleccionados
                </Button>
                <Button
                  disabled={!favorites.some(item => item.selected)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Añadir al carrito
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => toggleSelect(item.id)}
                      className="absolute top-2 right-2"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-lg font-semibold mt-2">{item.price}€</p>
                    <div className="mt-4 space-x-2">
                      <Button size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Añadir al carrito
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No tienes productos favoritos
            </h2>
            <p className="text-muted-foreground mb-4">
              Explora nuestro catálogo y guarda los productos que más te gusten
            </p>
            <Button>Explorar productos</Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
