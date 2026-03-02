'use client';
// src/components/ui/cards/ChartCard.tsx
import * as React from 'react';
import { Card, CardHeader, Divider, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  timeLabel?: string;       // sağda italik gri metin
  right?: React.ReactNode;  // istersen custom bir sağ içerik (select, buton vs.)
  hideDivider?: boolean;
};

export default function ChartCard({ title, children, timeLabel, right, hideDivider = false }: ChartCardProps) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const actionNode =
    right ??
    (timeLabel ? (
      <Typography
        variant="body2"
        sx={{
          fontStyle: 'italic',
          color: 'text.secondary',
          fontSize: 12,
          opacity: 0.75,
        }}
      >
        {timeLabel}
      </Typography>
    ) : null);

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2.5,
        boxShadow: isLight
          ? '0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)'
          : undefined,
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="h6"
            sx={{
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: 0.1,
            }}
          >
            {title}
          </Typography>
        }
        action={actionNode}
        sx={{
          py: 1.5,
          px: 2,
          '& .MuiCardHeader-action': { alignSelf: 'center', m: 0 },
        }}
      />
      {hideDivider ? null : (
        <Divider
          sx={{
            opacity: 0.6,
          }}
        />
      )}
      <CardContent sx={{ px: 2, pb: '16px !important', pt: 1.5, overflow: 'hidden' }}>
        {children}
      </CardContent>
    </Card>
  );
}
