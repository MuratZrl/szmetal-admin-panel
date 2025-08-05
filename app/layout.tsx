// app/layout.tsx
'use server'

import './globals.css';
import { Box } from '@mui/material';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Box>
          {children}
        </Box>
      </body>
    </html>
  );
}