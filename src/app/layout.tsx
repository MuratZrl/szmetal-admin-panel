// app/layout.tsx
import * as React from 'react';

import { cookies } from 'next/headers';

import { InitColorSchemeScript } from '@mui/material'; // <— DOĞRU import

import { fontSans, fontMono } from './fonts';

import Providers from '@/providers';

type Mode = 'light' | 'dark' | 'system';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Next 15: cookies() async, o yüzden await
  const jar = await cookies();
  const initialMode = (jar.get('theme-mode')?.value as Mode | undefined) ?? 'system';

  return (
    <html lang="tr" suppressHydrationWarning className={`${fontSans.variable} ${fontMono.variable}`} >
      <head>
        {/* İlk boyada tema modunu sabitle. CssVarsProvider kullanmasan da zararı yok. */}
        <InitColorSchemeScript defaultMode={initialMode} />
      </head>
      <body>
        <Providers initialMode={initialMode}>{children}</Providers>
      </body>
    </html>
  );
}
