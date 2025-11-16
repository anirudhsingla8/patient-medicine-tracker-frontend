
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CustomThemeProvider from './components/CustomThemeProvider';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CustomThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
