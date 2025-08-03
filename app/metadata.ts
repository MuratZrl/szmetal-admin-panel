// app/metadata.ts
import type { Metadata } from 'next';

const baseUrl = 'https://szmetal-admin-panel.vercel.app'; // kendi domain'inle değiştir

export const metadata: Metadata = {
  title: {
    default: 'SZ Metal Panel',
    template: '%s | SZ Metal',
  },
  description: 'SZ Metal için modern, hızlı ve güvenli bir yönetim paneli.',
  applicationName: 'SZ Metal Admin Panel',
  generator: 'Next.js 15 + App Router',
  keywords: [
    'SZ Metal',
    'Alutem',
    'SZ Metal Sipariş',
    'Alutem Sipariş',
    'SZ Metal Panel',
    'Web Paneli',
  ],
  authors: [
    { name: 'SZ Metal', url: baseUrl },
    { name: 'Admin Geliştirici', url: 'https://github.com/MuratZrl' },
  ],
  creator: 'SZ Metal',
  publisher: 'SZ Metal',

  metadataBase: new URL(baseUrl),

  openGraph: {
    title: 'SZ Metal Panel',
    description: 'A fully customizable and responsive admin panel developed for SZ Metal.',
    url: baseUrl,
    siteName: 'SZ Metal Panel',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`, // varsa özel Open Graph görselin
        width: 1200,
        height: 630,
        alt: 'SZ Metal Panel',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },

  manifest: '/site.webmanifest',

  category: 'structure and aluminium profiles',

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
};
