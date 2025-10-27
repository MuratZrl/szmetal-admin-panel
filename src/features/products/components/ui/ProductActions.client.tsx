// src/features/products/components/ui/ProductActions.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';

import {
  Box,
  Stack,
  Button,
  Checkbox,
} from '@mui/material';

import { alpha, useTheme } from '@mui/material/styles';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditIcon from '@mui/icons-material/Edit';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

type ProductActionsProps = {
  canEdit: boolean;
  canSelect: boolean;
  selected: boolean;
  onToggle: () => void;
  editHref: string;
  detailHref: string;
};

/**
 * “Product actions” alt şerit:
 * - Light/Dark görünürlük ve kontrast optimize.
 * - Temadaki surface ve accent genişletmelerini kullanır.
 * - İç kontroller kart satırını tetiklemez.
 * - Hiçbir yerde `any` yok.
 */
export function ProductActions({
  canEdit,
  canSelect,
  selected,
  onToggle,
  editHref,
  detailHref,
}: ProductActionsProps) {
  const theme = useTheme();

  // Accent yoksa primary’ye düş
  const accent = theme.palette.accent?.main ?? theme.palette.primary.main;

  // Surface ölçeği (theme.d.ts’te mecburen tanımlı)
  const S = theme.palette.surface;

  // Tonlamalar
  const softBg   = alpha(accent, theme.palette.mode === 'dark' ? 0.16 : 0.06);
  const hoverBg  = alpha(accent, theme.palette.mode === 'dark' ? 0.22 : 0.10);
  const pressBg  = alpha(accent, theme.palette.mode === 'dark' ? 0.28 : 0.14);
  const muted    = S.muted;
  const outline  = S.outline;

  // Ortak buton stili: okunaklı, “soft” dokunuşlu
  const commonBtnSx = {
    minHeight: 36,
    px: 1.5,
    borderRadius: 1.25,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: outline,
    color: theme.palette.text.primary,
    backgroundColor: softBg,
    transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow', 'transform'], {
      duration: theme.transitions.duration.shorter,
    }),
    '& .MuiButton-endIcon': { mr: 0 },
    '&:hover': {
      backgroundColor: hoverBg,
      borderColor: accent,
      boxShadow: `0 0 0 1px ${alpha(accent, 0.16)} inset, 0 2px 10px ${alpha(accent, 0.14)}`,
    },
    '&:active': {
      backgroundColor: pressBg,
      borderColor: accent,
      transform: 'translateY(0.5px)',
      boxShadow: `0 0 0 1px ${alpha(accent, 0.20)} inset`,
    },
    '&:focus-visible': {
      outline: `2px solid ${alpha(accent, 0.6)}`,
      outlineOffset: 2,
    },
  } as const;

  // “Outlined” edit butonu, daha belirgin kenar
  const editBtnSx = {
    ...commonBtnSx,
    backgroundColor: theme.palette.mode === 'dark' ? alpha(S[2], 0.3) : alpha(S[1], 0.4),
    borderColor: alpha(accent, 0.5),
    '&:hover': {
      ...commonBtnSx['&:hover'],
      backgroundColor: theme.palette.mode === 'dark' ? alpha(S[2], 0.42) : alpha(S[1], 0.56),
    },
  } as const;

  return (
    <Box
      role="group"
      sx={{
        // Üstteki Card footer border’ı zaten çiziyor; burada ekstra çizgi yok.
        background: `linear-gradient(180deg, ${alpha(S[2], 1)} 0%, ${alpha(S[1], 1)} 100%)`,
        px: { xs: 1, sm: 1.25 },
        pt: 0.75,
        pb: canSelect ? 0.5 : 0.75,
      }}
      onClick={(e) => {
        // İçerideki tıklamalar kartın Link’ini tetiklemesin
        e.stopPropagation();
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ minHeight: 42, gap: 1 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {canEdit && (
            <Button
              LinkComponent={Link}
              href={editHref}
              size="small"
              variant="outlined"
              endIcon={<EditIcon fontSize="small" />}
              draggable={false}
              aria-label="Ürünü düzenle"
              sx={editBtnSx}
            >
              Hızlı Düzenle
            </Button>
          )}
        </Stack>

        <Button
          LinkComponent={Link}
          href={detailHref}
          size="small"
          variant="text"
          endIcon={<ArrowForwardIosIcon fontSize="small" />}
          draggable={false}
          aria-label="Ürün profilini incele"
          sx={commonBtnSx}
        >
          Profili İncele
        </Button>
      </Stack>

      {canSelect && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            minHeight: 30,
            mt: 0.25,
          }}
        >
          <Checkbox
            aria-label={selected ? 'Ürün seçili, seçimi kaldır' : 'Ürünü seç'}
            size="small"
            checked={selected}
            onChange={onToggle}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<RadioButtonCheckedIcon />}
            sx={{
              color: muted,
              '& .MuiSvgIcon-root': { fontSize: 20 },
              '&.Mui-checked': {
                color: accent,
                '&:hover': {
                  backgroundColor: alpha(accent, theme.palette.mode === 'dark' ? 0.12 : 0.10),
                },
              },
              '&:hover': {
                backgroundColor: alpha(accent, theme.palette.mode === 'dark' ? 0.08 : 0.06),
              },
              transition: theme.transitions.create(['background-color', 'color', 'transform'], {
                duration: theme.transitions.duration.shorter,
              }),
            }}
          />
        </Box>
      )}
    </Box>
  );
}
