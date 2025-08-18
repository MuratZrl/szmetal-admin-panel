'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs, Typography, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

import { mainLinks } from '@/constants/mainlinks';

const formatBreadcrumb = (str: string) =>
  str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

const getLabelFromMainLinks = (href: string, segment: string): string => {
  const match = mainLinks.find(link => href === link.href || href === link.href + '/' + segment);
  if (match) return match.labelTr;

  if (/^[a-zA-Z0-9_-]{6,}$/.test(segment)) return 'Detay';
  if (segment === 'step2') return 'Adım 2';
  if (segment === 'step3') return 'Adım 3';

  return formatBreadcrumb(decodeURIComponent(segment));
};

const Breadcrumb = () => {
  const pathname = usePathname();
  const pathParts = pathname.split('/').filter(part => part);

  const breadcrumbs = [
    <Link
      key="home"
      href="/systems"
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <HomeIcon fontSize="small" />
    </Link>
  ];

  let previousLabel: string | null = null;

  pathParts.forEach((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const isLast = index === pathParts.length - 1;
    const label = getLabelFromMainLinks(href, part);

    // Aynı label daha önce gösterildiyse atla
    if (label === previousLabel) return;
    previousLabel = label;

    const item = isLast ? (
      <Typography key={href} color="text.primary" fontWeight={500}>
        {label}
      </Typography>
    ) : (
      <Link key={href} href={href} style={{ textTransform: 'capitalize' }}>
        {label}
      </Link>
    );

    breadcrumbs.push(item);
  });

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" >
        {breadcrumbs}
      </Breadcrumbs>
      <Divider sx={{ my: 1.5 }} />
    </>
  );
};

export default Breadcrumb;
