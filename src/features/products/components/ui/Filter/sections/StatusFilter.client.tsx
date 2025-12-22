// src/features/products/components/ui/Filter/sections/StatusFilter.client.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';

import { sectionSx } from '../sectionSx';

type StatusFilterSectionProps = {
  moldOnly: boolean;
  onToggleMold: () => void;
  availableOnly: boolean;
  onToggleAvailable: () => void;
};

type Row = {
  key: 'moldOnly' | 'availableOnly';
  label: string;
  checked: boolean;
  onToggle: () => void;
};

export function StatusFilterSection({
  moldOnly,
  onToggleMold,
  availableOnly,
  onToggleAvailable,
}: StatusFilterSectionProps): React.JSX.Element {
  const rows = React.useMemo<Row[]>(
    () => [
      { key: 'moldOnly', label: 'Müşteri Kalıbı', checked: moldOnly, onToggle: onToggleMold },
      { key: 'availableOnly', label: 'Kullanılamaz', checked: availableOnly, onToggle: onToggleAvailable },
    ],
    [moldOnly, onToggleMold, availableOnly, onToggleAvailable],
  );

  const isActive = moldOnly || availableOnly;

  const handleClear = React.useCallback(() => {
    // Toggle API'n var, "set false" yok. O yüzden sadece true olanları geri toggle'lıyoruz.
    if (moldOnly) onToggleMold();
    if (availableOnly) onToggleAvailable();
  }, [moldOnly, availableOnly, onToggleMold, onToggleAvailable]);

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
        <Typography variant="overline" sx={{ opacity: 0.75 }}>
          Durumlar
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

      <List dense disablePadding>
        {rows.map((r, idx) => (
          <React.Fragment key={r.key}>
            <ListItemButton
              disableRipple
              disableTouchRipple
              onClick={r.onToggle}
              sx={{
                pl: 1.25,
                pr: 1,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 1,
              }}
            >
              <FormControlLabel
                sx={{ m: 0, width: 1 }}
                control={
                  <Checkbox
                    checked={r.checked}
                    onChange={(e) => {
                      e.stopPropagation();
                      r.onToggle();
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
                label={<ListItemText primary={r.label} />}
              />
            </ListItemButton>

            {idx < rows.length - 1 ? <Divider sx={{ my: 0.75 }} /> : null}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
