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
      sx={(t) => ({
        height: 'auto',
        alignItems: 'flex-start',
        border: 0,
        bgcolor: t.palette.surface?.[3] ?? alpha(t.palette.action.hover, 0.32),
        color: t.palette.text.secondary,
        maxWidth: maxWidth ?? { xs: '100%', sm: 280 },
        minWidth: 0,
        '& .MuiChip-label': {
          display: 'block',
          whiteSpace: 'normal',
          overflow: 'visible',
          textOverflow: 'clip',
          px: 0.75,
          py: 0.25,
          width: '100%',
          minWidth: 0,
          alignItems: 'flex-start',
          gap: 2,
        },
      })}
    />
  );
}
