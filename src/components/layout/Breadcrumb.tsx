// src/components/layout/Breadcrumb.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { mainLinks } from '@/constants/mainlinks';
import type { UrlObject } from 'url';
import { alpha } from '@mui/material/styles'; // ← eklendi

const formatBreadcrumb = (str: string) =>
  str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

/** Özel segmentler için TR etiketleri */
const TR_SEGMENT_LABELS: Record<string, string> = {
  new: 'Yeni',
  edit: 'Düzenle',
  create: 'Yeni',
  update: 'Düzenle',
};

const getLabelFromMainLinks = (href: string, segmentRaw: string): string => {
  const segment = decodeURIComponent(segmentRaw);
  const top = mainLinks.find(link => href === link.href);
  if (top) return top.labelTr ?? top.label;

  const special = TR_SEGMENT_LABELS[segment.toLowerCase()];
  if (special) return special;

  if (/^[a-zA-Z0-9_-]{6,}$/.test(segment)) return 'Detay';
  if (segment === 'step2') return 'Adım 2';
  if (segment === 'step3') return 'Adım 3';

  return formatBreadcrumb(segment);
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const pathParts = React.useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

  // İster UrlObject bırak, ister string kullan — Next Link ikisini de yer.
  const homeHref: UrlObject = { pathname: '/create_request' };

  const breadcrumbs: React.ReactNode[] = [
    <Link key="home" href={homeHref} style={{ display: 'flex', alignItems: 'center' }}>
      <HomeIcon fontSize="small" color="primary" />
    </Link>,
  ];

  let previousLabel: string | null = null;

  pathParts.forEach((part, index) => {
    const hrefStr = '/' + pathParts.slice(0, index + 1).join('/');
    const hrefObj: UrlObject = { pathname: hrefStr };
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
    <Breadcrumbs
      aria-label="breadcrumb"
      sx={{
        // Sadece bu bileşen içindeki <a>’ları hedefle
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          fontWeight: 600,
          textUnderlineOffset: '3px',
          WebkitTapHighlightColor: 'transparent',
          transition: 'color .15s ease, text-decoration-color .15s ease',
        },
        '& a:visited': {
          color: 'primary.main', // mor yok
        },
        '& a:hover': theme => ({
          textDecoration: 'underline',
          textDecorationColor: alpha(theme.palette.primary.main, 0.5),
        }),
        '& a:active': theme => ({
          color: theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.main, 0.85)
            : alpha(theme.palette.primary.main, 0.9),
        }),
        '& a:focus-visible': theme => ({
          outline: 'none',
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.35)}`,
          borderRadius: 1,
        }),
      }}
    >
      {breadcrumbs}
    </Breadcrumbs>
  );
}
