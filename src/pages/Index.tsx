import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryGrid } from "@/components/CategoryGrid";

const promotions = [
  {
    title: "Oferta Especial en Herramientas",
    description: "Hasta 30% de descuento en herramientas eléctricas",
    image: "https://images.unsplash.com/photo-1581147036324-c1c88bb6eb4e?w=800&auto=format&fit=crop"
  },
  {
    title: "Promoción en Materiales de Construcción",
    description: "Compra ahora y recibe entrega gratuita",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop"
  },
  {
    title: "Descuentos en Iluminación",
    description: "2x1 en lámparas LED",
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&auto=format&fit=crop"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-8">Bienvenido a Nuestra Tienda</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promotions.map((promo, index) => (
              <div 
                key={index}
                className="bg-accent rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img 
                  src={promo.image} 
                  alt={promo.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{promo.title}</h3>
                  <p className="text-muted-foreground">{promo.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Comprar por Categoría</h2>
          <CategoryGrid />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Recomendado para Ti</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Placeholder for product recommendations */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="aspect-square bg-muted rounded-md mb-4"></div>
              <h3 className="font-medium">Nombre del Producto</h3>
              <p className="text-sm text-gray-600">Desde €XX.XX</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;