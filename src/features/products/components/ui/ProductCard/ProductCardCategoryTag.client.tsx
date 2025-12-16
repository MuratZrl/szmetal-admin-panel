// src/features/products/components/ui/ProductCardCategoryTag.client.tsx
'use client';

import * as React from 'react';
import { Chip, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { alpha } from '@mui/material/styles';

type CategoryChipProps = {
  category?: string | null;
  subcategory?: string | null;
  /** Breadcrumb için tam path: ['Root', 'Alt', 'Leaf'] */
  segments?: string[];
  title?: string;
  maxWidth?: { xs: string | number; sm: string | number };
};

export function CategoryChip({
  category,
  subcategory,
  segments,
  title,
  maxWidth,
}: CategoryChipProps) {
  // Öncelik: segments; yoksa eski 2-lu yapı
  const parts =
    segments && segments.length > 0
      ? segments
      : ([category, subcategory].filter(Boolean) as string[]);

  if (!parts.length) return null;

  return (
    <Chip
      size="small"
      variant="filled"
      title={title}
      label={
        <Box
          component="span"
          sx={{
            display: 'inline',
            whiteSpace: 'normal',
            overflow: 'visible',
            textOverflow: 'clip',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            lineHeight: 1.25,
          }}
        >
          {parts.map((part, i) => (
            <React.Fragment key={`${part}-${i}`}>
              {i > 0 && (
                <>
                  <wbr />
                  <ArrowForwardIosIcon
                    fontSize="inherit"
                    sx={{ mx: 0.75, opacity: 0.85, verticalAlign: 'middle' }}
                    aria-hidden
                  />
                  <wbr />
                </>
              )}
              <span>{part}</span>
            </React.Fragment>
          ))}
        </Box>
      }
      sx={(t) => {
        const bg = t.palette.surface?.[2] ?? alpha(t.palette.action.selected, 0.22);
        const bd = t.palette.surface?.outline ?? alpha(t.palette.text.primary, 0.22);
        const hoverBg = t.palette.surface?.[3] ?? alpha(t.palette.action.selected, 0.30);

        return {
          height: 'auto',
          alignItems: 'flex-start',
          maxWidth: maxWidth ?? { xs: '100%', sm: 280 },
          minWidth: 0,

          // ✅ daha belirgin yüzey
          bgcolor: bg,
          color: t.palette.text.primary,              // secondary yerine primary
          border: '1px solid',
          borderColor: bd,
          borderRadius: 1,
          boxShadow: `0 1px 0 ${alpha('#000', t.palette.mode === 'dark' ? 0.35 : 0.12)}`,

          // ✅ hover'da hafif vurgu (göz bunu sever)
          transition: t.transitions.create(['background-color', 'border-color', 'box-shadow'], {
            duration: t.transitions.duration.shorter,
          }),
          '&:hover': {
            bgcolor: hoverBg,
            borderColor: alpha(t.palette.contrast.main, 0.35),
            boxShadow: `0 2px 10px ${alpha('#000', t.palette.mode === 'dark' ? 0.35 : 0.18)}`,
          },

          '& .MuiChip-label': {
            display: 'block',
            whiteSpace: 'normal',
            overflow: 'visible',
            textOverflow: 'clip',
            px: 0.75,
            py: 0.35,
            width: '100%',
            minWidth: 0,
            alignItems: 'flex-start',
            gap: 2,

            // ✅ metin daha “etiket” gibi dursun
            fontWeight: 650,
            letterSpacing: 0.1,
          },

          // ✅ ok ikonunu da biraz belirginleştir
          '& svg': {
            opacity: 1,
            color: alpha(t.palette.text.primary, 0.75),
          },
        };
      }}
    />
  );
}
