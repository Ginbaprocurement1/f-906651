
import { useEffect, useState } from "react";
import { Location } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkCenterStore } from "@/stores/useWorkCenterStore";

export const WorkCenterSelect = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const { selectedLocation, setSelectedLocation } = useWorkCenterStore();

  useEffect(() => {
    const fetchLocations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('master_user')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userData?.company_id) return;

      const { data } = await supabase
        .from('master_client_locations')
        .select('*')
        .eq('company_id', userData.company_id)
        .order('location_name');

      if (data && data.length > 0) {
        setLocations(data);
        if (!selectedLocation) {
          setSelectedLocation(data[0]);
        }
      }
    };

    fetchLocations();
  }, [setSelectedLocation, selectedLocation]);

  if (!locations.length) return null;

  return (
    <Select
      value={selectedLocation?.delivery_location_id?.toString()}
      onValueChange={(value) => {
        const location = locations.find(
          (loc) => loc.delivery_location_id.toString() === value
        );
        if (location) {
          setSelectedLocation(location);
        }
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Centro de trabajo" />
      </SelectTrigger>
      <SelectContent>
        {locations.map((location) => (
          <SelectItem
            key={location.delivery_location_id}
            value={location.delivery_location_id.toString()}
          >
            {location.location_name || location.address}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
