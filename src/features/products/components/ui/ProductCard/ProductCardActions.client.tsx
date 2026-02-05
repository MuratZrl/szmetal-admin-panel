'use client';
// src/features/products/components/ui/ProductCardActions.client.tsx

import * as React from 'react';
import Link from 'next/link';

import { Box, Stack, Button } from '@mui/material';
import { alpha, darken, useTheme } from '@mui/material/styles';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditIcon from '@mui/icons-material/Edit';

type ProductActionsProps = {
  canEdit: boolean;
  editHref: string;
  detailHref: string;
};

type SurfacePalette = {
  0?: string;
  1?: string;
  2?: string;
  outline?: string;
};

export function ProductActions({
  canEdit,
  editHref,
  detailHref,
}: ProductActionsProps): React.JSX.Element {
  const theme = useTheme();

  const accent = theme.palette.accent?.main ?? theme.palette.primary.main;
  const S = theme.palette.surface as SurfacePalette | undefined;

  const outline = S?.outline ?? theme.palette.divider;
  const surface1 = S?.[1] ?? theme.palette.background.paper;
  const surface2 = S?.[2] ?? theme.palette.background.default;

  const primaryText = theme.palette.getContrastText(accent);

  const primaryBg = theme.palette.mode === 'dark' ? darken(accent, 0.12) : accent;
  const primaryHover = theme.palette.mode === 'dark' ? darken(accent, 0.2) : darken(accent, 0.08);
  const primaryActive = theme.palette.mode === 'dark' ? darken(accent, 0.26) : darken(accent, 0.14);

  const neutralBorder =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.grey[500], 0.75)
      : alpha(theme.palette.grey[700], 0.75);

  const neutralBg =
    theme.palette.mode === 'dark'
      ? alpha(surface2, 0.65)
      : alpha(surface1, 0.85);

  const neutralHover =
    theme.palette.mode === 'dark'
      ? alpha(surface2, 0.9)
      : alpha(surface1, 0.98);

  const neutralActive =
    theme.palette.mode === 'dark'
      ? alpha(surface2, 0.98)
      : surface1;

  const baseBtnSx = {
    flex: 1,
    minWidth: 0,
    width: { xs: 1, sm: 'auto' },
    minHeight: { xs: 34, sm: 38, md: 40 },
    px: { xs: 1.25, sm: 1.5 },
    py: { xs: 0.6, sm: 0.75 },
    fontSize: { xs: 12, sm: 13, md: 14 },
    fontWeight: 700,
    textTransform: 'none' as const,
    borderRadius: 999,
    transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow', 'transform'], {
      duration: theme.transitions.duration.shorter,
    }),
    '& .MuiButton-endIcon': { ml: 0.5, mr: 0 },
    '& .MuiButton-endIcon .MuiSvgIcon-root': {
      fontSize: { xs: 16, sm: 18, md: 20 },
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shorter,
      }),
      willChange: 'transform',
    },
    '&:focus-visible': {
      outline: `2px solid ${alpha(accent, 0.6)}`,
      outlineOffset: 2,
    },
  } as const;

  const editBtnSx = {
    ...baseBtnSx,
    color: theme.palette.text.primary,
    border: `1px solid ${neutralBorder}`,
    backgroundColor: neutralBg,
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: neutralHover,
      borderColor: neutralBorder,
      boxShadow: `0 0 0 1px ${alpha(outline, 0.35)} inset`,
    },
    '&:active': {
      backgroundColor: neutralActive,
      transform: 'translateY(0.5px)',
      boxShadow: `0 0 0 1px ${alpha(outline, 0.45)} inset`,
    },
  } as const;

  const detailBtnSx = {
    ...baseBtnSx,
    color: primaryText,
    border: `1px solid ${alpha(accent, theme.palette.mode === 'dark' ? 0.55 : 0.35)}`,
    backgroundColor: primaryBg,
    boxShadow: `0 6px 18px ${alpha(accent, theme.palette.mode === 'dark' ? 0.22 : 0.18)}`,
    '&:hover': {
      backgroundColor: primaryHover,
      boxShadow: `0 8px 22px ${alpha(accent, theme.palette.mode === 'dark' ? 0.28 : 0.22)}`,
    },
    '&:active': {
      backgroundColor: primaryActive,
      transform: 'translateY(0.5px)',
      boxShadow: `0 4px 14px ${alpha(accent, theme.palette.mode === 'dark' ? 0.22 : 0.18)}`,
    },
    '&:hover .MuiButton-endIcon .MuiSvgIcon-root, &:focus-visible .MuiButton-endIcon .MuiSvgIcon-root': {
      transform: 'translateX(4px)',
    },
  } as const;

  return (
    <Box
      role="group"
      sx={{
        px: { xs: 1, sm: 1.25, md: 0 },
        pt: 1,
        pb: 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="stretch"
        spacing={{ xs: 1, sm: 1.25 }}
        sx={{ minHeight: 42 }}
      >
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
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Düzenle
            </Box>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Hızlı Düzenle
            </Box>
          </Button>
        )}

        <Button
          LinkComponent={Link}
          href={detailHref}
          size="small"
          variant="contained"
          disableElevation
          endIcon={<ArrowForwardIosIcon fontSize="small" />}
          draggable={false}
          aria-label="Ürün profilini incele"
          sx={detailBtnSx}
        >
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            İncele
          </Box>
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Profili İncele
          </Box>
        </Button>
      </Stack>
    </Box>
  );
}
