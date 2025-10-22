// src/features/products/components/ui/CategoryTag.client.tsx
'use client';

import * as React from 'react';
import { Chip, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { alpha } from '@mui/material/styles';

type CategoryChipProps = {
  category?: string | null;
  subcategory?: string | null;
  title?: string;
  maxWidth?: { xs: string | number; sm: string | number };
};

export function CategoryChip({ category, subcategory, title, maxWidth }: CategoryChipProps) {
  const parts = [category, subcategory].filter(Boolean) as string[];

  return parts.length ? (
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
  ) : null;
}
