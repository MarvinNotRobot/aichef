import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appLogger } from '../logger';

interface UIState {
  isLogPanelVisible: boolean;
  toggleLogPanel: () => void;
  setLogPanelVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isLogPanelVisible: true,
      
      toggleLogPanel: () => {
        set((state) => {
          const newValue = !state.isLogPanelVisible;
          appLogger.info('Log panel visibility toggled', { visible: newValue });
          return { isLogPanelVisible: newValue };
        });
      },
      
      setLogPanelVisible: (visible: boolean) => {
        set({ isLogPanelVisible: visible });
        appLogger.info('Log panel visibility set', { visible });
      }
    }),
    {
      name: 'ui-settings',
      partialize: (state) => ({ isLogPanelVisible: state.isLogPanelVisible })
    }
  )
);