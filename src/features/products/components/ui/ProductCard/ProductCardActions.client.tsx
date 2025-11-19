// src/features/products/components/ui/ProductActions.client.tsx
'use client';

import Link from 'next/link';

import { Box, Stack, Button, Checkbox } from '@mui/material';
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

export function ProductActions({
  canEdit,
  canSelect,
  selected,
  onToggle,
  editHref,
  detailHref,
}: ProductActionsProps): React.JSX.Element {
  const theme = useTheme();
  const accent = theme.palette.accent?.main ?? theme.palette.primary.main;
  const danger = theme.palette.error.main;
  const S = theme.palette.surface;

  const softBg  = alpha(accent, theme.palette.mode === 'dark' ? 0.16 : 0.06);
  const hoverBg = alpha(accent, theme.palette.mode === 'dark' ? 0.22 : 0.10);
  const pressBg = alpha(accent, theme.palette.mode === 'dark' ? 0.28 : 0.14);
  const outline = S.outline;
  const muted   = S.muted;

  const commonBtnSx = {
    flex: 1,
    minWidth: 0,
    width: { xs: 1, sm: 'auto' },
    minHeight: { xs: 32, sm: 36, md: 40 },

    px: { xs: 1, sm: 1.25, md: 1.5 },
    py: { xs: 0.5, sm: 0.6, md: 0.75 },

    fontSize: { xs: 12, sm: 13, md: 14 },
    borderRadius: 1.25,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: outline,
    color: theme.palette.text.primary,
    backgroundColor: softBg,

    transition: theme.transitions.create(
      ['background-color', 'border-color', 'box-shadow', 'transform'],
      { duration: theme.transitions.duration.shorter }
    ),
    
    '& .MuiButton-endIcon': { ml: 0.5, mr: 0 },
    
    '& .MuiButton-endIcon .MuiSvgIcon-root': {
      fontSize: { xs: 16, sm: 18, md: 20 },
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shorter,
      }),

      willChange: 'transform',
    },
    
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

  const editBtnSx = {
    ...commonBtnSx,
    transform: 'skewX(-3deg)',

    backgroundColor: theme.palette.mode === 'dark' ? alpha(S[2], 0.3) : alpha(S[1], 0.4),
    borderColor: alpha(accent, 0.5),
    display: { xs: 'none', sm: 'inline-flex' },

    // dış kırmızı çerçeve (tema error renginden)
    outline: `1px solid ${alpha(danger, 0.9)}`,
    outlineOffset: 2,

    '& .MuiButton-endIcon .MuiSvgIcon-root': {
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shorter,
      }),
    },

    '&:hover': {
      backgroundColor: hoverBg,
      borderColor: accent,
      boxShadow: `0 0 0 1px ${alpha(accent, 0.16)} inset, 0 2px 10px ${alpha(accent, 0.14)}`,
    },

    '&:active': {
      backgroundColor: pressBg,
      borderColor: accent,
      transform: 'skewX(-5deg) translateY(0.5px)',
      boxShadow: `0 0 0 1px ${alpha(accent, 0.20)} inset`,
    },

    '&:focus-visible': {
      outline: `2px solid ${danger}`,
      outlineOffset: 2,
    },
  } as const;

  const detailBtnSx = {
    ...commonBtnSx,
    '& .MuiButton-endIcon': { ml: { xs: 0, sm: 0.5 } },
    '&:hover .MuiButton-endIcon .MuiSvgIcon-root, &:focus-visible .MuiButton-endIcon .MuiSvgIcon-root': {
      transform: 'translateX(4px)',
    },
  } as const;

  return (
    <Box
      role="group"
      sx={{ px: { xs: 1, sm: 1.25, md: 0 }, pt: 1, pb: 1 }}
      onClick={(e) => { e.stopPropagation(); }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
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
            Hızlı Düzenle
          </Button>
        )}

        <Button
          LinkComponent={Link}
          href={detailHref}
          size="small"
          variant="text"
          endIcon={<ArrowForwardIosIcon fontSize="small" />}
          draggable={false}
          aria-label="Ürün profilini incele"
          sx={detailBtnSx}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Profili İncele
          </Box>
        </Button>
      </Stack>

      {false && canSelect && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
            minHeight: 30,
            mt: 0.75,
            px: { xs: 0.25, sm: 0 },
          }}
        >
          <Box
            component="span"
            sx={{
              display: { xs: 'inline', sm: 'none' },
              fontSize: 12,
              color: 'text.secondary',
            }}
          >
            Seç
          </Box>

          <Checkbox
            aria-label={selected ? 'Ürün seçili, seçimi kaldır' : 'Ürünü seç'}
            size="small"
            checked={selected}
            onChange={() => { onToggle(); }}
            icon={<RadioButtonUncheckedIcon fontSize="small" />}
            checkedIcon={<RadioButtonCheckedIcon fontSize="small" />}
            sx={{
              ml: { xs: 0, sm: 0.5 },
              color: muted,
              '& .MuiSvgIcon-root': { fontSize: { xs: 18, sm: 20 } },
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
