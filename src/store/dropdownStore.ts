import { create } from 'zustand';

interface DropdownStore {
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
}

export const useDropdownStore = create<DropdownStore>((set) => ({
  activeDropdownId: null,
  setActiveDropdownId: (id) => set({ activeDropdownId: id }),
})); 