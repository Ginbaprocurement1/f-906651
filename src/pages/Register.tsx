import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Registro</h1>
          <p className="text-gray-500 mb-8">Esta página está en construcción</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;