import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactInformation } from "@/components/order/ContactInformation";
import { OrderSummaryCard } from "@/components/order/OrderSummaryCard";
import { useCartStore } from "@/stores/useCartStore";
import { useState } from "react";

const OrderConfirmation = () => {
  const { items, totalWithVAT, totalWithoutVAT } = useCartStore();
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const handleContactSelect = (contactId: string, name: string, phone: string) => {
    setSelectedContactId(contactId);
    setContactName(name);
    setPhoneNumber(phone);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto mt-32 mb-8">
        <h1 className="text-3xl font-bold mb-8">Confirmar Pedido</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ContactInformation onContactSelect={handleContactSelect} />
          </div>
          
          <div className="lg:col-span-1">
            <OrderSummaryCard
              subtotal={totalWithoutVAT()}
              vat={totalWithVAT() - totalWithoutVAT()}
              total={totalWithVAT()}
              buttonLabel="Confirmar pedido"
              buttonColor="bg-green-600 hover:bg-green-700"
              items={items}
              customAddressMode={{}}
              customAddresses={{}}
              selectedContactId={selectedContactId}
              newName={contactName}
              newPhone={phoneNumber}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;