'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs, Typography, Divider } from '@mui/material';
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
  if (match) return match.labelTr;

  if (/^[a-zA-Z0-9_-]{6,}$/.test(segment)) return 'Detay';
  if (segment === 'step2') return 'Adım 2';
  if (segment === 'step3') return 'Adım 3';

  return formatBreadcrumb(decodeURIComponent(segment));
};

const Breadcrumb = () => {
  const pathname = usePathname();
  const pathParts = pathname.split('/').filter(Boolean);

  // Home link: string yerine UrlObject ver
  const homeHref: UrlObject = { pathname: '/create_request' };

  const breadcrumbs = [
    <Link key="home" href={homeHref} style={{ display: 'flex', alignItems: 'center' }}>
      <HomeIcon
        fontSize="small"
        sx={(t) => ({
          color: t.palette.mode === 'dark'
            ? t.palette.error.light   // karanlıkta görünür kalsın
            : t.palette.error.dark,   // aydınlıkta koyu kırmızı
        })}
      />
    </Link>
  ];

  let previousLabel: string | null = null;

  pathParts.forEach((part, index) => {
    const hrefStr = '/' + pathParts.slice(0, index + 1).join('/');
    const hrefObj: UrlObject = { pathname: hrefStr };
    const isLast = index === pathParts.length - 1;
    const label = getLabelFromMainLinks(hrefStr, part);

    if (label === previousLabel) return;
    previousLabel = label;

    const item = isLast ? (
      <Typography key={hrefStr} color="text.primary" fontWeight={500}>
        {label}
      </Typography>
    ) : (
      <Link key={hrefStr} href={hrefObj} style={{ textTransform: 'capitalize' }}>
        {label}
      </Link>
    );

    breadcrumbs.push(item);
  });

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb">
        {breadcrumbs}
      </Breadcrumbs>
      <Divider sx={{ my: 1.5 }} />
    </>
  );
};

export default Breadcrumb;
