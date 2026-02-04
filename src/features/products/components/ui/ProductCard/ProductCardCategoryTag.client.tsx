'use client';
// src/features/products/components/ui/ProductCardCategoryTag.client.tsx

import * as React from 'react';
import { Box, Chip } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { alpha } from '@mui/material/styles';

type CategoryChipProps = {
  category?: string | null;
  subcategory?: string | null;
  segments?: string[];
  title?: string;
  maxWidth?: { xs: string | number; sm: string | number; md?: string | number; lg?: string | number; xl?: string | number };
};

export function CategoryChip({
  category,
  subcategory,
  segments,
  title,
  maxWidth,
}: CategoryChipProps): React.JSX.Element | null {
  const parts =
    segments && segments.length > 0
      ? segments
      : ([category, subcategory].filter(Boolean) as string[]);

  if (parts.length === 0) return null;

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
        const hoverBg = t.palette.surface?.[3] ?? alpha(t.palette.action.selected, 0.3);

        return {
          height: 'auto',
          alignItems: 'flex-start',

          // ✅ Kart genişliğini kullan
          width: '100%',
          maxWidth: maxWidth ?? { xs: '100%', sm: '100%' },
          minWidth: 0,

          bgcolor: bg,
          color: t.palette.text.primary,
          border: '1px solid',
          borderColor: bd,
          borderRadius: 1,
          boxShadow: `0 1px 0 ${alpha('#000', t.palette.mode === 'dark' ? 0.35 : 0.12)}`,

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

            // ✅ Label alanı da full genişlik olsun
            width: '100%',
            minWidth: 0,

            alignItems: 'flex-start',
            gap: 2,
            fontWeight: 650,
            letterSpacing: 0.1,
          },

          '& svg': {
            opacity: 1,
            color: alpha(t.palette.text.primary, 0.75),
          },
        };
      }}
    />
  );
}
