
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location } from '@/types/order';

interface WorkCenterStore {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
}

export const useWorkCenterStore = create<WorkCenterStore>()(
  persist(
    (set) => ({
      selectedLocation: null,
      setSelectedLocation: (location) => set({ selectedLocation: location }),
    }),
    {
      name: 'work-center-storage',
    }
  )
);
