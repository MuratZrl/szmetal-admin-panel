// src/features/dashboard/components/TimeTicker.client.tsx
'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';

type Props = {
  timeZone?: string;          // varsayılan: Europe/Istanbul
  showSeconds?: boolean;      // saat: dk (+ saniye opsiyonel)
  dense?: boolean;            // daha kompakt tipografi
};

export default function TimeTicker({
  timeZone = 'Europe/Istanbul',
  showSeconds = false,
  dense = false,
}: Props) {
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), showSeconds ? 1000 : 30_000);
    return () => clearInterval(interval);
  }, [showSeconds]);

  const timeFmt = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' as const } : {}),
    hour12: false,
    timeZone,
  });
  const dateFmt = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    timeZone,
  });

  return (
    <Box sx={{ textAlign: 'right', lineHeight: 1.1 }}>
      <Typography variant={dense ? 'h6' : 'h5'} fontWeight={700}>
        {timeFmt.format(now)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {dateFmt.format(now)}
      </Typography>
    </Box>
  );
}
