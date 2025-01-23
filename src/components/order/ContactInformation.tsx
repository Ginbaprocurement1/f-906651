import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Contact {
  id: string;
  alias: string;
  contact_name: string;
  phone_number: string;
}

interface ContactInformationProps {
  onContactSelect: (contactId: string, contactName: string, phoneNumber: string) => void;
}

export const ContactInformation = ({ onContactSelect }: ContactInformationProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>("new");
  const [newAlias, setNewAlias] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('master_user')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (userData) {
          setCompanyId(userData.company_id);
          const { data: contactsData } = await supabase
            .from('master_client_contacts')
            .select('*')
            .eq('company_id', userData.company_id);

          if (contactsData) {
            const formattedContacts = contactsData.map(contact => ({
              id: contact.contact_id,
              alias: contact.alias,
              contact_name: contact.contact_name,
              phone_number: contact.phone_number
            }));
            setContacts(formattedContacts);
          }
        }
      }
    };

    fetchContacts();
  }, []);

  const handleContactSelect = (value: string) => {
    setSelectedContact(value);
    if (value === "new") {
      setNewName("");
      setNewPhone("");
      setNewAlias("");
      onContactSelect("new", "", "");
    } else {
      const contact = contacts.find(c => c.id === value);
      if (contact) {
        setNewName(contact.contact_name);
        setNewPhone(contact.phone_number);
        onContactSelect(contact.id, contact.contact_name, contact.phone_number);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case "alias":
        setNewAlias(value);
        break;
      case "name":
        setNewName(value);
        if (selectedContact === "new") {
          onContactSelect("new", value, newPhone);
        }
        break;
      case "phone":
        setNewPhone(value);
        if (selectedContact === "new") {
          onContactSelect("new", newName, value);
        }
        break;
    }
  };

  const handleSaveContact = async () => {
    if (!companyId || !newAlias || !newName || !newPhone) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from('master_client_contacts')
      .insert({
        company_id: companyId,
        alias: newAlias,
        contact_name: newName,
        phone_number: newPhone,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el contacto",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const newContact: Contact = {
        id: data.contact_id,
        alias: data.alias,
        contact_name: data.contact_name,
        phone_number: data.phone_number
      };
      setContacts([...contacts, newContact]);
      setSelectedContact(newContact.id);
      onContactSelect(newContact.id, newContact.contact_name, newContact.phone_number);
      toast({
        title: "Éxito",
        description: "Contacto guardado correctamente",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Información de contacto</h2>
      <div className="space-y-4">
        <Select value={selectedContact} onValueChange={handleContactSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar persona de contacto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Nuevo contacto</SelectItem>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.alias}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedContact === "new" && (
          <Input
            placeholder="Persona de contacto"
            value={newAlias}
            onChange={(e) => handleInputChange("alias", e.target.value)}
          />
        )}

        <Input
          placeholder="Nombre"
          value={newName}
          onChange={(e) => handleInputChange("name", e.target.value)}
          disabled={selectedContact !== "new"}
          className={selectedContact !== "new" ? "bg-gray-100" : ""}
        />

        <Input
          placeholder="Teléfono"
          value={newPhone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          disabled={selectedContact !== "new"}
          className={selectedContact !== "new" ? "bg-gray-100" : ""}
        />

        {selectedContact === "new" && (
          <Button 
            onClick={handleSaveContact}
            disabled={!newAlias || !newName || !newPhone}
          >
            Guardar contacto
          </Button>
        )}
      </div>
    </div>
  );
};