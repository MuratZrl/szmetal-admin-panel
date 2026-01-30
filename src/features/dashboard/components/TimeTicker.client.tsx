'use client';
// src/features/dashboard/components/TimeTicker.client.tsx

import * as React from 'react';
import { Box, Typography } from '@mui/material';

type Props = {
  timeZone?: string;     // varsayılan: Europe/Istanbul
  showSeconds?: boolean; // saat:dakika (+ saniye opsiyonel)
  dense?: boolean;       // daha kompakt tipografi
};

export default function TimeTicker({
  timeZone = 'Europe/Istanbul',
  showSeconds = false,
  dense = false,
}: Props) {
  // İlk boyamada dinamik metin basma -> SSR ve client aynı işareti görsün
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const tickMs = showSeconds ? 1000 : 30_000;
    const id = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(id);
  }, [mounted, showSeconds]);

  const timeFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        ...(showSeconds ? { second: '2-digit' as const } : {}),
        hour12: false,
        timeZone,
      }),
    [showSeconds, timeZone]
  );

  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        timeZone,
      }),
    [timeZone]
  );

  const placeholder = showSeconds ? '––:––:––' : '––:––';

  return (
    <Box sx={{ textAlign: 'right', lineHeight: 1.1 }}>
      <Typography
        variant={dense ? 'h6' : 'h5'}
        fontWeight={700}
        suppressHydrationWarning
      >
        {mounted ? timeFmt.format(now) : placeholder}
      </Typography>
      <Typography variant="body2" color="text.secondary" suppressHydrationWarning>
        {mounted ? dateFmt.format(now) : '\u00A0'}
      </Typography>
    </Box>
  );
}
