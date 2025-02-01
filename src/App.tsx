import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Index } from "./pages/Index";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Products } from "./pages/Products";
import { Orders } from "./pages/Orders";
import { Invoices } from "./pages/Invoices";
import { Financing } from "./pages/Financing";
import { Projects } from "./pages/Projects";
import { Favorites } from "./pages/Favorites";
import { SupplierStock } from "./pages/SupplierStock";
import { WarehouseStock } from "./pages/WarehouseStock";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Index /></Layout>
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/productos",
    element: <Layout><Products /></Layout>
  },
  {
    path: "/pedidos",
    element: <Layout><Orders /></Layout>
  },
  {
    path: "/facturas",
    element: <Layout><Invoices /></Layout>
  },
  {
    path: "/financiacion",
    element: <Layout><Financing /></Layout>
  },
  {
    path: "/proyectos",
    element: <Layout><Projects /></Layout>
  },
  {
    path: "/favoritos",
    element: <Layout><Favorites /></Layout>
  },
  {
    path: "/stock",
    element: <Layout><SupplierStock /></Layout>
  },
  {
    path: "/stock/:id",
    element: <Layout><WarehouseStock /></Layout>
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}