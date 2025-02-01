import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/order";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config(); // Load environment variables

// Load environment variables
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO;
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = process.env.SMTP_PORT || 587;

interface OrderSummaryCardProps {
  subtotal: number;
  vat: number;
  total: number;
  buttonLabel?: string;
  buttonColor?: string;
  items: CartItem[];
  customAddressMode: { [key: string]: boolean };
  customAddresses: {
    [key: string]: {
      address: string;
      postalCode: string;
      city: string;
      country: string;
      locationName: string;
    };
  };
  selectedContactId?: string;
  newName?: string;
  newPhone?: string;
}

export const OrderSummaryCard = ({ 
  subtotal, 
  vat, 
  total,
  buttonLabel = "Tramitar pedido",
  buttonColor = "bg-black hover:bg-gray-800",
  items,
  customAddressMode,
  customAddresses,
  selectedContactId,
  newName,
  newPhone
}: OrderSummaryCardProps) => {
  const navigate = useNavigate();

  const generatePoId = async (date: Date, companyId: number, supplierId: number) => {
    try {
      const year = format(date, 'yyyy');
      const month = format(date, 'MM');
      const day = format(date, 'dd');
      const formattedDate = format(date, 'yyyy-MM-dd');

      const { count } = await supabase
        .from('po_header')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('supplier_id', supplierId)
        .gte('created_at', `${formattedDate}T00:00:00`)
        .lt('created_at', `${formattedDate}T23:59:59`);

      const sequence = String(Number(count || 0) + 1).padStart(2, '0');
      return `${year}${month}${day}${companyId}${supplierId}${sequence}`;
    } catch (error) {
      console.error('Error generating PO ID:', error);
      throw error;
    }
  };

  const getLocationInfo = async (item: CartItem) => {
    try {
      let locationInfo = {
        location_name: '',
        address: '',
        town: '',
        zip_code: '',
        country: ''
      };

      console.log('Processing location info for item:', item);

      if (!item) {
        console.warn('Item is missing');
        return locationInfo;
      }

      if (item.delivery_method === "Envío") {
        if (item.delivery_location_id) {
          console.log('Fetching client location with ID:', item.delivery_location_id);
          
          const { data: locationData, error } = await supabase
            .from('master_client_locations')
            .select('location_name, address, town, zip_code, country')
            .eq('delivery_location_id', Number(item.delivery_location_id))
            .not('location_name', 'is', null)
            .not('address', 'is', null)
            .not('town', 'is', null)
            .not('zip_code', 'is', null)
            .not('country', 'is', null)
            .maybeSingle();

          if (error) {
            console.error('Error fetching client location:', error);
            return locationInfo;
          }

          if (locationData) {
            console.log('Found client location data:', locationData);
            locationInfo = {
              location_name: locationData.location_name || '',
              address: locationData.address || '',
              town: locationData.town || '',
              zip_code: locationData.zip_code ? String(locationData.zip_code) : '',
              country: locationData.country || ''
            };
          }
        } else {
          // Handle custom address case
          console.log('Using custom address data:', {
            custom_location_name: item.custom_location_name,
            custom_address: item.custom_address,
            custom_city: item.custom_city,
            custom_postal_code: item.custom_postal_code,
            custom_country: item.custom_country
          });
          
          locationInfo = {
            location_name: item.custom_location_name || '',
            address: item.custom_address || '',
            town: item.custom_city || '',
            zip_code: item.custom_postal_code || '',
            country: item.custom_country || ''
          };
        }
      } else if (item.delivery_method === "Recogida" && item.pickup_location_id) {
        console.log('Fetching supplier location with ID:', item.pickup_location_id);
        
        const { data: locationData, error } = await supabase
          .from('master_suppliers_locations')
          .select('location_name, address, town, zip_code, country')
          .eq('pickup_location_id', Number(item.pickup_location_id))
          .not('location_name', 'is', null)
          .not('address', 'is', null)
          .not('town', 'is', null)
          .not('zip_code', 'is', null)
          .not('country', 'is', null)
          .maybeSingle();

        if (error) {
          console.error('Error fetching supplier location:', error);
          return locationInfo;
        }

        if (locationData) {
          console.log('Found supplier location data:', locationData);
          locationInfo = {
            location_name: locationData.location_name || '',
            address: locationData.address || '',
            town: locationData.town || '',
            zip_code: locationData.zip_code ? String(locationData.zip_code) : '',
            country: locationData.country || ''
          };
        }
      }

      console.log('Final location info:', locationInfo);
      return locationInfo;
    } catch (error) {
      console.error('Error getting location info:', error);
      return {
        location_name: '',
        address: '',
        town: '',
        zip_code: '',
        country: ''
      };
    }
  };

  const getContactInfo = async () => {
    try {
      let contactInfo = {
        contact_name: '',
        phone_number: ''
      };

      console.log('Getting contact info with selectedContactId:', selectedContactId);

      if (selectedContactId === 'new') {
        console.log('Using new contact info:', { newName, newPhone });
        contactInfo = {
          contact_name: newName || '',
          phone_number: newPhone || ''
        };
      } else if (selectedContactId) {
        const { data: contactData, error } = await supabase
          .from('master_client_contacts')
          .select('contact_name, phone_number')
          .eq('contact_id', selectedContactId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching contact:', error);
          throw error;
        }

        if (contactData) {
          console.log('Found contact data:', contactData);
          contactInfo = {
            contact_name: contactData.contact_name,
            phone_number: contactData.phone_number
          };
        }
      }

      console.log('Final contact info:', contactInfo);
      return contactInfo;
    } catch (error) {
      console.error('Error getting contact info:', error);
      throw error;
    }
  };

  // Debugging: Check if credentials are loaded
console.log("📌 GMAIL_USER:", GMAIL_USER);
console.log("📌 GMAIL_PASS:", GMAIL_PASS ? "Loaded" : "Not Loaded");

// Validate credentials
if (!GMAIL_USER || !GMAIL_PASS) {
    console.error("❌ ERROR: Gmail credentials not found in .env file!");
    process.exit(1);
}

// Create email content
const mailOptions = {
    from: GMAIL_USER,
    to: EMAIL_TO,
    subject: "📨 Test Email - Ginba Procurement Partners",
    text: "Hola"
};

// Create transporter using Gmail SMTP with TLS (port 587)
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // false because we're using STARTTLS
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificates (fixes some TLS errors)
    }
});

// Function to send email
const sendSupplierEmail = async () => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.response);
    } catch (error) {
        console.error('❌ ERROR:', error);
    }
};


  const handleButtonClick = async () => {
    try {
      if (buttonLabel === "Tramitar pedido") {
        const supplierGroups = items.reduce((acc: { [key: string]: CartItem[] }, item) => {
          if (!acc[item.supplier_name]) {
            acc[item.supplier_name] = [];
          }
          acc[item.supplier_name].push(item);
          return acc;
        }, {});

        for (const [supplier, supplierItems] of Object.entries(supplierGroups)) {
          const firstItem = supplierItems[0];
          
          if (firstItem.delivery_method === "Envío") {
            if (customAddressMode[supplier]) {
              const supplierAddress = customAddresses[supplier];
              console.log('Updating cart items with custom address data for supplier:', supplier);
              
              const updates = supplierItems.map(item =>
                supabase
                  .from('cart_items')
                  .update({
                    custom_address: supplierAddress.address,
                    custom_postal_code: supplierAddress.postalCode,
                    custom_city: supplierAddress.city,
                    custom_country: supplierAddress.country,
                    custom_location_name: supplierAddress.locationName,
                    delivery_location_id: null
                  })
                  .eq('id', item.id)
              );
              
              await Promise.all(updates);
            } else if (firstItem.delivery_location_id) {
              console.log('Fetching location data for delivery_location_id:', firstItem.delivery_location_id);
              
              const { data: locationData, error } = await supabase
                .from('master_client_locations')
                .select('address, zip_code, town, country, location_name')
                .eq('delivery_location_id', Number(firstItem.delivery_location_id))
                .maybeSingle();

              if (error) {
                console.error('Error fetching location data:', error);
                throw error;
              }

              if (locationData) {
                console.log('Found location data:', locationData);
                
                const updates = supplierItems.map(item =>
                  supabase
                    .from('cart_items')
                    .update({
                      custom_address: locationData.address,
                      custom_postal_code: locationData.zip_code,
                      custom_city: locationData.town,
                      custom_country: locationData.country,
                      custom_location_name: locationData.location_name
                    })
                    .eq('id', item.id)
                );
                
                await Promise.all(updates);
                console.log('Updated cart items with location data for supplier:', supplier);
              }
            }
          }
        }

        navigate("/confirmar-pedido");
      } else if (buttonLabel === "Confirmar pedido") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuario no autenticado");

        const { data: userData } = await supabase
          .from('master_user')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (!userData?.company_id) throw new Error("Company ID no encontrado");

        const contactInfo = await getContactInfo();
        console.log('Contact info for PO:', contactInfo);

        const supplierGroups = items.reduce((acc: { [key: string]: CartItem[] }, item) => {
          if (!acc[item.supplier_name]) {
            acc[item.supplier_name] = [];
          }
          acc[item.supplier_name].push(item);
          return acc;
        }, {});

        for (const [supplier, supplierItems] of Object.entries(supplierGroups)) {
          const firstItem = supplierItems[0];
          console.log('Processing supplier:', supplier, 'with first item:', firstItem);

          const { data: supplierData } = await supabase
            .from('master_suppliers_company')
            .select('supplier_id')
            .eq('supplier_name', supplier)
            .single();

          if (!supplierData) {
            console.error('Supplier not found:', supplier);
            continue;
          }

          const poDate = new Date();
          const poId = await generatePoId(poDate, userData.company_id, supplierData.supplier_id);
          const locationInfo = await getLocationInfo(firstItem);
          console.log('Location info for PO:', locationInfo);

          const { error: headerError } = await supabase
            .from('po_header')
            .insert({
              po_id: poId,
              company_id: userData.company_id,
              supplier_id: supplierData.supplier_id,
              delivery_method: firstItem.delivery_method,
              payment_method: firstItem.payment_method,
              contact_name: contactInfo.contact_name,
              phone_number: contactInfo.phone_number,
              location_name: locationInfo.location_name || firstItem.custom_location_name || '',
              address: locationInfo.address || firstItem.custom_address || '',
              town: locationInfo.town || firstItem.custom_city || '',
              zip_code: locationInfo.zip_code || firstItem.custom_postal_code || '',
              country: locationInfo.country || firstItem.custom_country || ''
            });

          if (headerError) {
            console.error('Error creating PO header:', headerError);
            throw headerError;
          }

          const poLines = supplierItems.map(item => ({
            po_id: poId,
            product_id: item.product_id,
            quantity: item.quantity,
            price_without_vat: item.price_without_vat,
            price_with_vat: item.price_with_vat
          }));

          const { error: linesError } = await supabase
            .from('po_line')
            .insert(poLines);

          if (linesError) {
            console.error('Error creating PO lines:', linesError);
            throw linesError;
          }

          // Send email to supplier after PO creation
          await sendSupplierEmails(poId, supplier);
        }

        navigate('/');
      }
    } catch (error) {
      console.error('Error in handleButtonClick:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-32">
      <h2 className="text-xl font-semibold mb-4">Resumen</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between">
          <span>IVA</span>
          <span>{vat.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between">
          <span>Gastos de envío</span>
          <span className="text-green-600">Gratis</span>
        </div>
        <div className="pt-4 border-t mt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{total.toFixed(2)}€</span>
          </div>
        </div>
        <div className="space-y-2 pt-4">
          <Button 
            className={`w-full ${buttonColor}`}
            size="lg"
            onClick={handleButtonClick}
          >
            {buttonLabel}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={() => navigate('/')}
          >
            Seguir Comprando
          </Button>
        </div>
      </div>
    </div>
  );
};
