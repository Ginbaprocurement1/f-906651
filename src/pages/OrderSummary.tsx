import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { GroupedCartItems, Location } from "@/types/order";
import { SupplierOrderCard } from "@/components/order/SupplierOrderCard";
import { OrderSummaryCard } from "@/components/order/OrderSummaryCard";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { items, isLoading: isCartLoading, fetchCartItems, updateQuantity, removeFromCart, totalWithVAT, totalWithoutVAT } = useCartStore();
  const [groupedItems, setGroupedItems] = useState<GroupedCartItems>({});
  const [clientLocations, setClientLocations] = useState<Location[]>([]);
  const [customAddressMode, setCustomAddressMode] = useState<{[key: string]: boolean}>({});
  const [showSaveAddress, setShowSaveAddress] = useState<{[key: string]: boolean}>({});
  const [newLocationName, setNewLocationName] = useState<string>("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ company_id: number | null }>({ company_id: null });
  const [selectedLocations, setSelectedLocations] = useState<{[key: string]: string}>({});
  const [customAddresses, setCustomAddresses] = useState<{
    [key: string]: {
      address: string;
      postalCode: string;
      city: string;
      country: string;
      locationName: string;
    };
  }>({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('master_user')
          .select('company_id')
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setCurrentUser(userData);
        }
      }
    };
    
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsPageLoading(true);
        await Promise.all([
          fetchCartItems(),
          fetchClientLocations(),
          fetchSupplierLocations()
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading the order summary');
        toast({
          title: "Error",
          description: "Could not load order summary. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsPageLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (!isPageLoading && items.length === 0) {
      navigate('/');
      return;
    }

    const grouped = items.reduce((acc: GroupedCartItems, item) => {
      if (!acc[item.supplier_name]) {
        acc[item.supplier_name] = {
          items: [],
          locations: []
        };
      }
      acc[item.supplier_name].items.push(item);
      return acc;
    }, {});
    setGroupedItems(grouped);
  }, [items, navigate, isPageLoading]);

  const fetchClientLocations = async () => {
    if (!currentUser.company_id) return;
    
    const { data: locations, error } = await supabase
      .from('master_client_locations')
      .select('*')
      .eq('company_id', currentUser.company_id);
    
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las direcciones de entrega",
        variant: "destructive"
      });
      throw error;
    }
    
    if (locations) {
      const formattedLocations = locations.map(loc => ({
        ...loc,
        delivery_location_id: Number(loc.delivery_location_id)
      }));
      setClientLocations(formattedLocations);
    }
  };

  const fetchSupplierLocations = async () => {
    const { data: locations, error } = await supabase
      .from('master_suppliers_locations')
      .select(`
        *,
        master_suppliers_company (
          supplier_name
        )
      `);
    
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las ubicaciones de los proveedores",
        variant: "destructive"
      });
      throw error;
    }

    const updatedGroupedItems = { ...groupedItems };
    locations.forEach((location: any) => {
      const supplierName = location.master_suppliers_company.supplier_name;
      if (updatedGroupedItems[supplierName]) {
        updatedGroupedItems[supplierName].locations.push({
          ...location,
          supplier_name: supplierName
        });
      }
    });
    setGroupedItems(updatedGroupedItems);
  };

  const handleDeliveryMethodChange = async (supplier: string, method: string) => {
    try {
      const updates = groupedItems[supplier].items.map(item => 
        supabase
          .from('cart_items')
          .update({ delivery_method: method })
          .eq('id', item.id)
      );
      
      await Promise.all(updates);

      toast({
        title: "Actualizado",
        description: "Método de envío actualizado correctamente"
      });
      
      const updatedItems = { ...groupedItems };
      updatedItems[supplier].items = updatedItems[supplier].items.map(item => ({
        ...item,
        delivery_method: method
      }));
      setGroupedItems(updatedItems);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el método de envío",
        variant: "destructive"
      });
    }
  };

  const handlePaymentMethodChange = async (supplier: string, method: string) => {
    try {
      const updates = groupedItems[supplier].items.map(item =>
        supabase
          .from('cart_items')
          .update({ payment_method: method })
          .eq('id', item.id)
      );
      
      await Promise.all(updates);

      toast({
        title: "Actualizado",
        description: "Método de pago actualizado correctamente"
      });
      
      const updatedItems = { ...groupedItems };
      updatedItems[supplier].items = updatedItems[supplier].items.map(item => ({
        ...item,
        payment_method: method
      }));
      setGroupedItems(updatedItems);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el método de pago",
        variant: "destructive"
      });
    }
  };

  const handleLocationSelect = async (locationId: string, supplier: string) => {
    setSelectedLocations({ ...selectedLocations, [supplier]: locationId });
    
    if (locationId === "custom") {
      setCustomAddressMode({ ...customAddressMode, [supplier]: true });
      setCustomAddresses(prev => ({
        ...prev,
        [supplier]: {
          address: '',
          postalCode: '',
          city: '',
          country: '',
          locationName: ''
        }
      }));
    } else {
      const deliveryMethod = groupedItems[supplier].items[0]?.delivery_method;
      
      if (deliveryMethod === "Envío") {
        const location = clientLocations.find(loc => loc.delivery_location_id === Number(locationId));
        if (location) {
          setCustomAddresses(prev => ({
            ...prev,
            [supplier]: {
              address: location.address || "",
              postalCode: location.zip_code || "",
              city: location.town || "",
              country: location.country || "",
              locationName: ''
            }
          }));
          setCustomAddressMode({ ...customAddressMode, [supplier]: false });
        }
      }

      try {
        const updates = groupedItems[supplier].items.map(item =>
          supabase
            .from('cart_items')
            .update(deliveryMethod === "Envío" 
              ? { delivery_location_id: Number(locationId) }
              : { pickup_location_id: Number(locationId) }
            )
            .eq('id', item.id)
        );
        
        await Promise.all(updates);
        
        toast({
          title: "Actualizado",
          description: "Ubicación actualizada correctamente"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar la ubicación",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveAddress = async (supplier: string) => {
    if (!currentUser.company_id) {
      toast({
        title: "Error",
        description: "No se pudo guardar la dirección. Usuario no identificado.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('master_client_locations')
        .insert({
          company_id: currentUser.company_id,
          location_name: customAddresses[supplier]?.locationName,
          address: customAddresses[supplier]?.address,
          zip_code: customAddresses[supplier]?.postalCode,
          town: customAddresses[supplier]?.city,
          country: customAddresses[supplier]?.country
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Dirección guardada correctamente"
      });

      const { data: locations } = await supabase
        .from('master_client_locations')
        .select('*')
        .eq('company_id', currentUser.company_id);
      
      setClientLocations(locations || []);
      setNewLocationName("");
      setShowSaveAddress({ ...showSaveAddress, [supplier]: false });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la dirección",
        variant: "destructive"
      });
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto mt-32 mb-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto mt-32 mb-8">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Resumen del Pedido</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedItems).map(([supplier, { items, locations }]) => {
              const supplierAddress = customAddresses[supplier] || {
                address: '',
                postalCode: '',
                city: '',
                country: '',
                locationName: ''
              };
              
              return (
                <SupplierOrderCard
                  key={supplier}
                  supplier={supplier}
                  items={items}
                  locations={locations}
                  clientLocations={clientLocations}
                  selectedLocation={selectedLocations[supplier]}
                  customAddressMode={customAddressMode[supplier]}
                  customAddress={supplierAddress.address}
                  customPostalCode={supplierAddress.postalCode}
                  customCity={supplierAddress.city}
                  customCountry={supplierAddress.country}
                  newLocationName={supplierAddress.locationName}
                  onDeliveryMethodChange={(method) => handleDeliveryMethodChange(supplier, method)}
                  onPaymentMethodChange={(method) => handlePaymentMethodChange(supplier, method)}
                  onLocationSelect={(locationId) => handleLocationSelect(locationId, supplier)}
                  onAddressChange={(e) => setCustomAddresses(prev => ({
                    ...prev,
                    [supplier]: {
                      ...prev[supplier],
                      address: e.target.value
                    }
                  }))}
                  onPostalCodeChange={(e) => setCustomAddresses(prev => ({
                    ...prev,
                    [supplier]: {
                      ...prev[supplier],
                      postalCode: e.target.value
                    }
                  }))}
                  onCityChange={(e) => setCustomAddresses(prev => ({
                    ...prev,
                    [supplier]: {
                      ...prev[supplier],
                      city: e.target.value
                    }
                  }))}
                  onCountryChange={(e) => setCustomAddresses(prev => ({
                    ...prev,
                    [supplier]: {
                      ...prev[supplier],
                      country: e.target.value
                    }
                  }))}
                  onLocationNameChange={(e) => setCustomAddresses(prev => ({
                    ...prev,
                    [supplier]: {
                      ...prev[supplier],
                      locationName: e.target.value
                    }
                  }))}
                  onSaveAddress={() => handleSaveAddress(supplier)}
                  onUpdateQuantity={(id, quantity) => updateQuantity(Number(id), quantity)}
                  onRemoveItem={(id) => removeFromCart(Number(id))}
                />
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <OrderSummaryCard
              subtotal={totalWithoutVAT()}
              vat={totalWithVAT() - totalWithoutVAT()}
              total={totalWithVAT()}
              items={items}
              customAddressMode={customAddressMode}
              customAddresses={customAddresses}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSummary;
