import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-auto">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Sobre Ginbat</h3>
            <p className="text-neutral-600">
              Contacto: +34 900 123 456
              <br />
              Email: info@ginbat.com
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">¿Eres proveedor?</h3>
            <Button variant="link" className="p-0 h-auto text-neutral-600 hover:text-primary">
              Únete a nosotros
            </Button>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Productos y Soluciones</h3>
            <ul className="space-y-2">
              <li>
                <Button variant="link" className="p-0 h-auto text-neutral-600 hover:text-primary">
                  Catálogo completo
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto text-neutral-600 hover:text-primary">
                  Novedades
                </Button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Blog</h3>
            <Button variant="link" className="p-0 h-auto text-neutral-600 hover:text-primary">
              Ver últimos artículos
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};