import { create } from 'zustand';

const storedProject = sessionStorage.getItem('activeProject');
const initialProject = storedProject ? JSON.parse(storedProject) : null;

export const useProjectStore = create((set) => ({
  activeProject: initialProject,
  setActiveProject: (activeProject) => {
    sessionStorage.setItem('activeProject', JSON.stringify(activeProject));
    set({ activeProject });
  },
  clearActiveProject: () => {
    sessionStorage.removeItem('activeProject');
    set({ activeProject: null });
  },
}));
