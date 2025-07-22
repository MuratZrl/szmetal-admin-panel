'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs, Typography, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const formatBreadcrumb = (str: string) =>
  str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

const Breadcrumb = () => {
  const pathname = usePathname();
  const pathParts = pathname.split('/').filter(part => part);

  const breadcrumbs = [
    <Link key="home" href="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
      <HomeIcon fontSize="small" />
    </Link>,

    ...pathParts.map((part, index) => {
      const href = '/' + pathParts.slice(0, index + 1).join('/');
      const isLast = index === pathParts.length - 1;
      const label = formatBreadcrumb(decodeURIComponent(part));

      return isLast ? (
        <Typography key={href} color="text.primary" fontWeight={500}>
          {label}
        </Typography>
      ) : (
        <Link key={href} href={href} style={{ textTransform: 'capitalize' }}>
          {label}
        </Link>
      );
    }),
  ];

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
