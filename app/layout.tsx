// app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';

import { Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'SZ Metal Panel',
  description: 'Admin panel for SZ Metal',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Box>
          {children}
        </Box>
      </body>
    </html>
  );
}