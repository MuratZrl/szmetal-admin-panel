// src/components/ui/cards/ChartCard.tsx
import * as React from 'react';
import { Card, CardHeader, Divider, CardContent, Typography } from '@mui/material';

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  timeLabel?: string;       // sağda italik gri metin
  right?: React.ReactNode;  // istersen custom bir sağ içerik (select, buton vs.)
  hideDivider?: boolean;
};

export default function ChartCard({ title, children, timeLabel, right, hideDivider = false }: ChartCardProps) {
  const actionNode =
    right ??
    (timeLabel ? (
      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
        {timeLabel}
      </Typography>
    ) : null);

  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardHeader
        title={<Typography variant="h6">{title}</Typography>}
        action={actionNode}
        sx={{
          py: 1.5,
          px: 2,
          '& .MuiCardHeader-action': { alignSelf: 'center', m: 0 }, // sağ içerik dikey ortalansın
        }}
      />
      {hideDivider ? null : <Divider />}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
