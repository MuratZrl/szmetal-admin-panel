// app/layout.tsx
import './globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
          {children}
      </body>
    </html>
  );
}