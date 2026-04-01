'use client';
// src/features/products/components/ui/Filter/sections/UpdatedFilter.client.tsx

import * as React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

import { sectionSx } from '../sectionSx';
import { UPDATED_FROM_ID, UPDATED_TO_ID } from '@/features/products/components/ui/Filter/constants';

type UpdatedFilterSectionProps = {
  updatedFrom: string;
  updatedTo: string;
  onChangeUpdatedFrom: (value: string) => void;
  onChangeUpdatedTo: (value: string) => void;
};

export function UpdatedFilterSection({
  updatedFrom,
  updatedTo,
  onChangeUpdatedFrom,
  onChangeUpdatedTo,
}: UpdatedFilterSectionProps): React.JSX.Element {
  const insetX = 1.5;

  const toDayjs = React.useCallback((v: string): Dayjs | null => {
    if (!v) return null;
    const d = dayjs(v, 'YYYY-MM-DD', true);
    return d.isValid() ? d : null;
  }, []);

  const toIso = React.useCallback((d: Dayjs | null): string => (d ? d.format('YYYY-MM-DD') : ''), []);

  const isActive = updatedFrom.trim().length > 0 || updatedTo.trim().length > 0;

  const handleClear = React.useCallback(() => {
    onChangeUpdatedFrom('');
    onChangeUpdatedTo('');
  }, [onChangeUpdatedFrom, onChangeUpdatedTo]);

  return (
    <Box
      component="section"
      sx={(t) => ({
        ...sectionSx(t),
        borderRadius: 2.25,
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pl: insetX,
          pr: insetX,
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          Güncelleme Tarihi
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

      <Box
        sx={(t) => ({
          mt: 1,
          mb: 1.5,
          height: 2,
          borderRadius: 999,
          bgcolor: t.palette.divider,
        })}
      />

      <Box sx={{ px: insetX }}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <DatePicker
              label="Tarih baş."
              format="DD/MM/YY"
              value={toDayjs(updatedFrom)}
              onChange={(val) => onChangeUpdatedFrom(toIso(val))}
              slotProps={{
                textField: {
                  id: UPDATED_FROM_ID,
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
              value={toDayjs(updatedTo)}
              onChange={(val) => onChangeUpdatedTo(toIso(val))}
              slotProps={{
                textField: {
                  id: UPDATED_TO_ID,
                  size: 'small',
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
