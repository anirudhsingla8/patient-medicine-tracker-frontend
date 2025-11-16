import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type PaletteMode } from '@mui/material';

interface ThemeState {
  mode: PaletteMode;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage', // unique name
    }
  )
);
