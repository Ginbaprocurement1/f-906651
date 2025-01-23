import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
      <main className="flex-1 mt-32">
        {children}
      </main>
      <Footer />
    </div>
  );
};