
import { useMemo } from 'react';
import { ThemeProvider, CssBaseline, createTheme, responsiveFontSizes } from '@mui/material';
import { useThemeStore } from './store/themeStore';
import { getThemeOptions } from './styles/theme';

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeStore();
  const themeOptions = useMemo(() => getThemeOptions(mode), [mode]);
  const theme = useMemo(() => responsiveFontSizes(createTheme(themeOptions)), [themeOptions]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
