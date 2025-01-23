import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PlusCircle, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Projects = () => {
  const [projects] = useState([
    {
      id: 1,
      name: "Reforma Cocina",
      createdAt: "2024-02-20",
      items: 12,
      totalCost: 2500.50,
    },
    {
      id: 2,
      name: "Baño Principal",
      createdAt: "2024-02-15",
      items: 8,
      totalCost: 1800.75,
    },
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mis Proyectos</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label htmlFor="project-name" className="text-sm font-medium">
                    Nombre del Proyecto
                  </label>
                  <Input
                    id="project-name"
                    placeholder="Ej: Reforma Cocina"
                    className="mt-1"
                  />
                </div>
                <Button className="w-full">Crear Proyecto</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Creado el {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">{project.items}</span> productos
                  </p>
                  <p className="text-sm">
                    Total: <span className="font-medium">{project.totalCost.toFixed(2)}€</span>
                  </p>
                </div>
                <Button className="w-full mt-4">
                  Ver Detalles
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No tienes proyectos
            </h2>
            <p className="text-muted-foreground mb-4">
              Crea tu primer proyecto para organizar tus productos
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Crear Proyecto</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label htmlFor="project-name" className="text-sm font-medium">
                      Nombre del Proyecto
                    </label>
                    <Input
                      id="project-name"
                      placeholder="Ej: Reforma Cocina"
                      className="mt-1"
                    />
                  </div>
                  <Button className="w-full">Crear Proyecto</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Projects;