'use client';
// src/features/products/components/ui/Filter/sections/DateRangeFilter.client.tsx

import * as React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

import { sectionSx } from '../sectionSx';

import { DATE_FROM_ID, DATE_TO_ID } from '@/features/products/components/ui/Filter/constants';

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

  const isActive = from.trim().length > 0 || to.trim().length > 0;

  const handleClear = React.useCallback(() => {
    onChangeFrom('');
    onChangeTo('');
  }, [onChangeFrom, onChangeTo]);

  return (
    <Box
      component="section"
      sx={(t) => ({
        ...sectionSx(t),
        borderRadius: 2.25,
      })}
    >
      {/* Başlık satırı: solda başlık, sağda Temizle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          Tarih
        </Typography>

        <Button
          variant="text"
          size="small"
          disableRipple
          disabled={!isActive}
          onClick={handleClear}
          sx={{
            minWidth: 'auto',
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            textTransform: 'none',
            lineHeight: 1.2,
            '&:hover': { backgroundColor: 'transparent' },
            '&:active': { backgroundColor: 'transparent' },
            '&.Mui-focusVisible': { backgroundColor: 'transparent' },
          }}
        >
          Temizle
        </Button>
      </Box>

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
                id: DATE_FROM_ID,
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
                id: DATE_TO_ID,
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
