// app/metadata.ts
import type { Metadata } from 'next';

const baseUrl = 'https://szmetal-admin-panel.com'; // kendi domain'inle değiştir

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
    description: 'SZ Metal için özelleştirilmiş yönetim arayüzü.',
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

  twitter: {
    card: 'summary_large_image',
    title: 'SZ Metal Panel',
    description: 'SZ Metal için özel olarak geliştirilmiş yönetim paneli.',
    creator: '@szmetal', // varsa Twitter kullanıcı adınız
    images: [`${baseUrl}/og-image.jpg`],
  },

  manifest: '/site.webmanifest',

  category: 'structure and aluminium',

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
