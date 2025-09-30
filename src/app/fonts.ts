// app/fonts.ts
import { Inter, JetBrains_Mono } from 'next/font/google';

// Türkçe için latin-ext’i da al. swap = metrik kaydırmadan hızlı render.
export const fontSans = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
});
