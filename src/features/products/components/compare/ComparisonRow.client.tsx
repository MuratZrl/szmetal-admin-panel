'use client';
// src/features/products/components/compare/ComparisonRow.client.tsx

import * as React from 'react';
import { TableRow, TableCell, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

type Props = {
  label: string;
  values: React.ReactNode[];
  highlight?: boolean;
};

export default function ComparisonRow({ label, values, highlight = false }: Props) {
  return (
    <TableRow
      sx={(t) => ({
        ...(highlight
          ? {
              bgcolor:
                t.palette.mode === 'dark'
                  ? alpha(t.palette.warning.dark, 0.15)
                  : alpha(t.palette.warning.main, 0.08),
            }
          : {}),
      })}
    >
      {/* Etiket sütunu (sticky) */}
      <TableCell
        sx={(t) => ({
          position: 'sticky',
          left: 0,
          zIndex: 1,
          bgcolor: highlight
            ? t.palette.mode === 'dark'
              ? alpha(t.palette.warning.dark, 0.15)
              : alpha(t.palette.warning.main, 0.08)
            : 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          minWidth: 180,
          maxWidth: 200,
          py: 1,
          px: 1.5,
        })}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </TableCell>

      {/* Değer sütunları */}
      {values.map((value, i) => (
        <TableCell
          key={i}
          sx={{
            minWidth: 200,
            py: 1,
            px: 1.5,
            verticalAlign: 'top',
          }}
        >
          {typeof value === 'string' || typeof value === 'number' ? (
            <Typography variant="body2">{value}</Typography>
          ) : (
            value
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}
