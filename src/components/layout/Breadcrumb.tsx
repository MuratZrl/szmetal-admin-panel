// src/components/layout/Breadcrumb.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { mainLinks } from '@/constants/mainlinks';
import type { UrlObject } from 'url'; // sadece tip, runtime yok

const formatBreadcrumb = (str: string) =>
  str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

const getLabelFromMainLinks = (href: string, segment: string): string => {
  const match = mainLinks.find(link => href === link.href || href === `${link.href}/${segment}`);
  if (match) return match.labelTr ?? match.label; // ← fallback: her zaman string

  if (/^[a-zA-Z0-9_-]{6,}$/.test(segment)) return 'Detay';
  if (segment === 'step2') return 'Adım 2';
  if (segment === 'step3') return 'Adım 3';

  return formatBreadcrumb(decodeURIComponent(segment));
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const pathParts = React.useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

  // Home link: string yerine UrlObject ver
  const homeHref: UrlObject = { pathname: '/create_request' };

  const breadcrumbs: React.ReactNode[] = [
    <Link key="home" href={homeHref} style={{ display: 'flex', alignItems: 'center' }}>
      <HomeIcon fontSize="small" color="primary" />
    </Link>,
  ];

  let previousLabel: string | null = null;

  pathParts.forEach((part, index) => {
    const hrefStr = '/' + pathParts.slice(0, index + 1).join('/');
    const hrefObj: UrlObject = { pathname: hrefStr }; // ← KİLİT NOKTA
    const isLast = index === pathParts.length - 1;
    const label = getLabelFromMainLinks(hrefStr, part);

    if (label === previousLabel) return;
    previousLabel = label;

    breadcrumbs.push(
      isLast ? (
        <Typography key={hrefStr} color="text.primary" fontWeight={500}>
          {label}
        </Typography>
      ) : (
        <Link key={hrefStr} href={hrefObj} style={{ textTransform: 'capitalize' }}>
          {label}
        </Link>
      ),
    );
  });

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb">{breadcrumbs}</Breadcrumbs>
    </>
  );
}
