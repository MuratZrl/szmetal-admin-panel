'use client';
// src/components/ui/snackbar/useSnackbar.client.tsx

import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

type Severity = 'success' | 'error' | 'info';
type SnackbarState = {
  open: boolean;
  message?: string;
  severity?: Severity;
};

type Ctx = { show: (msg: string, severity?: Severity) => void };

const SnackbarContext = createContext<Ctx>({ show: () => {} });

// Tek ve sabit tema (uygulama temasından bağımsız)
const snackbarTheme = createTheme({
  palette: { mode: 'light' },
});

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SnackbarState>({ open: false });

  const show = (message: string, severity: Severity = 'info') => {
    setState({ open: true, message, severity });
  };

  const close = () => setState(s => ({ ...s, open: false }));

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <MuiThemeProvider theme={snackbarTheme}>
        <Snackbar
          open={state.open}
          autoHideDuration={4000}
          onClose={close}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={close} severity={state.severity ?? 'info'} variant="filled" sx={{ width: '100%' }}>
            {state.message}
          </Alert>
        </Snackbar>
      </MuiThemeProvider>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
