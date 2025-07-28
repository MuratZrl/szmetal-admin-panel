// app/layout.tsx

import './globals.css';
import { metadata } from '../metadata';

export { metadata }; // ✅ EXPORT EDİLİYOR

import { Box } from '@mui/material';

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