// src/components/ui/snackbar/useSnackbar.client.tsx
"use client";
import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

type SnackbarState = {
  open: boolean;
  message?: string;
  severity?: "success" | "error" | "info";
};

const SnackbarContext = createContext<{ show: (msg: string, severity?: SnackbarState["severity"]) => void; }>({ show: () => {} });

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SnackbarState>({ open: false });

  const show = (message: string, severity: SnackbarState["severity"] = "info") => {
    setState({ open: true, message, severity });
  };

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={() => setState(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setState(s => ({ ...s, open: false }))}
          severity={state.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
