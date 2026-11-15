import { create } from 'zustand';

export const useProjectStore = create((set) => ({
  activeProject: null,
  setActiveProject: (activeProject) => set({ activeProject }),
  clearActiveProject: () => set({ activeProject: null }),
}));
