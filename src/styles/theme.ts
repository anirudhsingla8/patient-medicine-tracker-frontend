
import { type PaletteMode, type ThemeOptions } from '@mui/material';

const FONT_FAMILY_SANS =
  'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"';

// App design tokens
export const tokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#6366f1' /* Indigo 500 */ },
          secondary: { main: '#ec4899' /* Pink 500 */ },
          background: {
            default: '#f8fafc', // Slate 50
            paper: '#ffffff', // White
          },
          text: {
            primary: '#1e293b', // Slate 800
            secondary: '#475569', // Slate 600
          },
          divider: '#e2e8f0', // Slate 200
        }
      : {
          primary: { main: '#818cf8' /* Indigo 400 */ },
          secondary: { main: '#f472b6' /* Pink 400 */ },
          background: {
            default: '#0f172a', // Slate 900
            paper: '#1e293b', // Slate 800
          },
          text: {
            primary: '#f1f5f9', // Slate 100
            secondary: '#94a3b8', // Slate 400
          },
          divider: '#334155', // Slate 700
        }),
  },
});

export const getThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  ...tokens(mode),
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: FONT_FAMILY_SANS,
    h4: { fontWeight: 700, color: mode === 'dark' ? '#f1f5f9' : '#1e293b' },
    h5: { fontWeight: 600, color: mode === 'dark' ? '#f1f5f9' : '#1e293b' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          backgroundColor: theme.palette.background.default,
          backgroundImage: 'none',
        },
      }),
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
        }),
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
        }),
      },
    },
  },
});
