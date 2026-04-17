'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { WebSocketProvider } from '@/context/WebSocketContext';
import AppLayout from '@/components/AppLayout';
import './globals.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6',
    },
    secondary: {
      main: '#10B981',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <WebSocketProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1E293B',
                  color: '#F1F5F9',
                  borderRadius: '12px',
                },
              }}
            />
          </WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}