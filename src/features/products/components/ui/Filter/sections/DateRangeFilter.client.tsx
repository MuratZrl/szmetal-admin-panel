// src/features/products/components/ui/Filter/sections/DateRangeFilter.client.tsx
'use client';

import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

import { sectionSx } from '../sectionSx';

type DateRangeFilterSectionProps = {
  from: string;
  to: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
};

export function DateRangeFilterSection({
  from,
  to,
  onChangeFrom,
  onChangeTo,
}: DateRangeFilterSectionProps): React.JSX.Element {
  const toDayjs = React.useCallback((v: string): Dayjs | null => {
    if (!v) return null;
    const d = dayjs(v, 'YYYY-MM-DD', true);
    return d.isValid() ? d : null;
  }, []);

  const toIso = React.useCallback((d: Dayjs | null): string => (d ? d.format('YYYY-MM-DD') : ''), []);

  return (
    <Box
      component="section"
      sx={(t) => ({
        ...sectionSx(t),
        borderRadius: 2.25,
      })}
    >
      <Typography variant="overline" sx={{ opacity: 0.8 }}>
        Tarih
      </Typography>

      {/* Başlık ile içerik arasında düz renk separator */}
      <Box
        sx={(t) => ({
          mt: 1,
          mb: 1.5,
          height: 2,
          borderRadius: 999,
          bgcolor: t.palette.divider,
        })}
      />

      <Grid container spacing={1}>
        <Grid size={{ xs: 6 }}>
          <DatePicker
            label="Tarih baş."
            format="DD/MM/YY"
            value={toDayjs(from)}
            onChange={(val) => onChangeFrom(toIso(val))}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                InputLabelProps: { shrink: true },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <DatePicker
            label="Tarih bitiş"
            format="DD/MM/YY"
            value={toDayjs(to)}
            onChange={(val) => onChangeTo(toIso(val))}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                InputLabelProps: { shrink: true },
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
