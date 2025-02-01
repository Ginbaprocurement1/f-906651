import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Products = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <h1 className="text-2xl font-bold mb-6">Productos</h1>
        <p className="text-gray-500">Esta página está en construcción</p>
      </main>
      <Footer />
    </div>
  );
};