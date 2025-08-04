// app/layout.tsx

import './globals.css';
import { Box } from '@mui/material';

export default function RootLayout({ children }: { children: React.ReactNode }) {
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