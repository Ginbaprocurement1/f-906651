import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface CompanyInfo {
  company_name: string;
  CIF: string;
  address: string;
  zip_code: string;
  town: string;
  country: string;
}

export const BillingInformation = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('master_user')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (userData) {
          const { data: companyData } = await supabase
            .from('master_client_company')
            .select('company_name, CIF, address, zip_code, town, country')
            .eq('company_id', userData.company_id)
            .single();

          if (companyData) {
            setCompanyInfo({
              ...companyData,
              zip_code: companyData.zip_code?.toString() || "" // Convert number to string
            });
          }
        }
      }
    };

    fetchCompanyInfo();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Información de facturación</h2>
      <div className="space-y-4">
        <Input
          placeholder="Razón social"
          value={companyInfo?.company_name || ""}
          disabled
          className="bg-gray-100"
        />
        <Input
          placeholder="CIF"
          value={companyInfo?.CIF || ""}
          disabled
          className="bg-gray-100"
        />
        <Input
          placeholder="Dirección"
          value={companyInfo?.address || ""}
          disabled
          className="bg-gray-100"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Código postal"
            value={companyInfo?.zip_code || ""}
            disabled
            className="bg-gray-100"
          />
          <Input
            placeholder="Localidad"
            value={companyInfo?.town || ""}
            disabled
            className="bg-gray-100"
          />
        </div>
        <Input
          placeholder="País"
          value={companyInfo?.country || ""}
          disabled
          className="bg-gray-100"
        />
      </div>
    </div>
  );
};